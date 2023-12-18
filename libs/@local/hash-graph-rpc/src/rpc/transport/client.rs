use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};

use error_stack::ResultExt;
use libp2p::{
    futures::StreamExt,
    request_response::{Event, Message, OutboundRequestId},
    swarm::SwarmEvent,
    Multiaddr, PeerId,
};
use tokio::{
    select,
    sync::{mpsc, oneshot},
    time,
};

use crate::rpc::{
    transport::{
        log_behaviour_event, BehaviourCollectionEvent, SpawnGuard, TransportConfig, TransportError,
        TransportLayer,
    },
    Error, Request, Response,
};

#[derive(Debug, Copy, Clone, PartialOrd, Ord, PartialEq, Eq, Hash)]
struct Ticket(u64);

#[derive(Debug, Clone)]
struct TicketKiosk {
    next: Arc<AtomicU64>,
}

impl TicketKiosk {
    fn new() -> Self {
        Self {
            next: Arc::new(AtomicU64::new(0)),
        }
    }

    fn draw_next(&self) -> Ticket {
        Ticket(self.next.fetch_add(1, Ordering::SeqCst))
    }
}

enum EventLoopRequest {
    Send(Ticket, Request, oneshot::Sender<Response>),
    Cancel(Ticket),
}

struct EventLoopContext {
    server_address: Multiaddr,
    server_peer_id: Option<PeerId>,

    dialing: bool,

    waiting: Vec<(Ticket, Request, oneshot::Sender<Response>)>,
    pending: HashMap<OutboundRequestId, (Ticket, oneshot::Sender<Response>)>,
    lookup: HashMap<Ticket, OutboundRequestId>,
}

impl EventLoopContext {
    fn new(server_address: Multiaddr) -> Self {
        Self {
            server_address,
            server_peer_id: None,

            dialing: false,

            waiting: vec![],
            pending: HashMap::new(),
            lookup: HashMap::new(),
        }
    }

    fn dial(&mut self, transport: &mut TransportLayer) {
        if self.dialing {
            return;
        }

        let result = match self.server_peer_id {
            Some(server_peer_id) => transport.swarm.dial(server_peer_id),
            None => transport.swarm.dial(self.server_address.clone()),
        };

        if let Err(error) = result {
            tracing::error!(?error, "failed to dial server");
        } else {
            self.dialing = true;
        }
    }

    fn flush_waiting(&mut self, transport: &mut TransportLayer) {
        let Some(peer_id) = self.server_peer_id else {
            // do not flush waiting now, only once we've dialed the server and know the
            // server_peer_id
            self.dial(transport);
            return;
        };

        self.pending
            .extend(self.waiting.drain(..).map(|(ticket, request, tx)| {
                (
                    transport
                        .swarm
                        .behaviour_mut()
                        .protocol
                        .send_request(&peer_id, request),
                    (ticket, tx),
                )
            }));
    }

    fn cancel_pending(&mut self) {
        for (_, (ticket, tx)) in self.pending.drain() {
            let response = Response::error(Error::ConnectionClosed);

            self.lookup.remove(&ticket);
            if let Err(error) = tx.send(response) {
                tracing::error!(?error, "failed to send response");
            }
        }
    }
}

pub(crate) struct ClientTransportConfig {
    pub(crate) transport: TransportConfig,

    pub(crate) remote: Multiaddr,
}

pub(crate) struct ClientTransportLayer {
    tx: mpsc::Sender<EventLoopRequest>,
    kiosk: TicketKiosk,
    _guard: SpawnGuard,
}

impl ClientTransportLayer {
    pub(crate) fn new(config: ClientTransportConfig) -> error_stack::Result<Self, TransportError> {
        let transport = TransportLayer::new(config.transport)?;

        let (tx, rx) = mpsc::channel(32);
        let guard = tokio::spawn(Self::event_loop(transport, config.remote, rx)).into();

        Ok(Self {
            tx,
            kiosk: TicketKiosk::new(),
            _guard: guard,
        })
    }

    fn handle_channel_event(
        transport: &mut TransportLayer,

        request: EventLoopRequest,

        context: &mut EventLoopContext,
    ) {
        match request {
            EventLoopRequest::Send(ticket, request, tx) => {
                let Some(server) = context.server_peer_id else {
                    context.waiting.push((ticket, request, tx));
                    context.dial(transport);
                    return;
                };

                let request_id = transport
                    .swarm
                    .behaviour_mut()
                    .protocol
                    .send_request(&server, request);

                context.pending.insert(request_id, (ticket, tx));
                context.lookup.insert(ticket, request_id);
            }
            EventLoopRequest::Cancel(ticket) => {
                let Some(request_id) = context.lookup.remove(&ticket) else {
                    return;
                };

                context.pending.remove(&request_id);
            }
        }
    }

    fn handle_swarm_event(
        transport: &mut TransportLayer,

        event: SwarmEvent<BehaviourCollectionEvent>,

        context: &mut EventLoopContext,
    ) {
        match event {
            SwarmEvent::Behaviour(BehaviourCollectionEvent::Protocol(event)) => {
                log_behaviour_event(&event);

                if let Event::Message { peer, message } = event {
                    match message {
                        Message::Request { request, .. } => {
                            tracing::trace!(?peer, ?request, "request received");
                        }
                        Message::Response {
                            request_id,
                            response,
                        } => {
                            tracing::trace!(?request_id, ?response, "response received");

                            if let Some((ticket, tx)) = context.pending.remove(&request_id) {
                                context.lookup.remove(&ticket);
                                if let Err(error) = tx.send(response) {
                                    tracing::error!(?error, "failed to send response");
                                }
                            }
                        }
                    }
                }
            }
            SwarmEvent::ConnectionEstablished {
                peer_id, endpoint, ..
            } => {
                tracing::trace!(?peer_id, ?endpoint, "connection established");

                if *endpoint.get_remote_address() != context.server_address {
                    return;
                }

                context.server_peer_id = Some(peer_id);
                context.dialing = false;

                context.flush_waiting(transport);
            }
            SwarmEvent::ConnectionClosed {
                peer_id, endpoint, ..
            } => {
                tracing::trace!(?peer_id, ?endpoint, "connection closed");

                if *endpoint.get_remote_address() != context.server_address {
                    return;
                }

                context.cancel_pending();
            }

            _ => {}
        }
    }

    async fn event_loop(
        mut transport: TransportLayer,
        remote: Multiaddr,
        mut rx: mpsc::Receiver<EventLoopRequest>,
    ) -> ! {
        let mut context = EventLoopContext::new(remote);

        loop {
            select! {
                Some(request) = rx.recv() => {
                    Self::handle_channel_event(&mut transport, request, &mut context);
                },
                event = transport.swarm.select_next_some() => {
                    Self::handle_swarm_event(&mut transport, event, &mut context);
                }
            }
        }
    }

    pub(crate) async fn call(
        &self,
        request: Request,
    ) -> error_stack::Result<Response, TransportError> {
        let (tx, rx) = oneshot::channel();

        let ticket = self.kiosk.draw_next();
        self.tx
            .send(EventLoopRequest::Send(ticket, request, tx))
            .await
            .change_context(TransportError)?;

        rx.await.change_context(TransportError)
    }

    pub(crate) async fn call_with_timeout(
        &self,
        request: Request,
        timeout: Duration,
    ) -> error_stack::Result<Response, TransportError> {
        let (tx, rx) = oneshot::channel();

        let ticket = self.kiosk.draw_next();
        self.tx
            .send(EventLoopRequest::Send(ticket, request, tx))
            .await
            .change_context(TransportError)?;

        let result = time::timeout(timeout, rx).await;

        if let Ok(result) = result {
            result.change_context(TransportError)
        } else {
            self.tx
                .send(EventLoopRequest::Cancel(ticket))
                .await
                .change_context(TransportError)?;

            Ok(Response::error(Error::DeadlineExceeded))
        }
    }

    pub(crate) async fn call_with_deadline(
        &self,
        request: Request,
        deadline: Instant,
    ) -> error_stack::Result<Response, TransportError> {
        self.call_with_timeout(request, deadline - Instant::now())
            .await
    }
}
