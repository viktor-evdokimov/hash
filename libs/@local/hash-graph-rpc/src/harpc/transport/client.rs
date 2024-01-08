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
    request_response,
    request_response::{Event, Message, OutboundRequestId},
    swarm::{NetworkBehaviour, SwarmEvent},
    Multiaddr, PeerId,
};
use thiserror::Error;
#[cfg(not(target_arch = "wasm32"))]
use tokio::time;
use tokio::{
    select,
    sync::{mpsc, oneshot},
};
use tokio_util::sync::CancellationToken;

use crate::harpc::transport::{
    codec::Codec,
    log_behaviour_event,
    message::{
        request::Request,
        response::{Response, ResponseError},
    },
    BehaviourCollectionEvent, SpawnGuard, TransportConfig, TransportError, TransportLayer,
};

#[derive(Debug, Copy, Clone, Error)]
#[error(
    "unrecoverable error: transport event loop has crashed and is offline. This shouldn't ever \
     happen."
)]
pub(crate) struct EventLoopOfflineError;

#[derive(Debug, Copy, Clone, Error)]
#[error("channel to event loop has been dropped. This shouldn't ever happen.")]
pub(crate) struct BrokenChannelError;

#[derive(Debug, Clone)]
pub struct ClientTransportMetrics {
    pub server_address: Multiaddr,
    pub server_peer_id: Option<PeerId>,

    pub dialing: bool,
    pub pending: usize,
    pub lookup: usize,
    pub waiting: usize,
}

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
    Metrics(oneshot::Sender<ClientTransportMetrics>),
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

        for (ticket, request, tx) in self.waiting.drain(..) {
            let request_id = transport
                .swarm
                .behaviour_mut()
                .protocol
                .send_request(&peer_id, request);

            self.lookup.insert(ticket, request_id);
            self.pending.insert(request_id, (ticket, tx));
        }
    }

    fn cancel_pending(&mut self) {
        for (_, (ticket, tx)) in self.pending.drain() {
            let response = Response::error(ResponseError::ConnectionClosed);

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

#[derive(Debug, Clone)]
pub(crate) struct ClientTransportLayer {
    tx: mpsc::Sender<EventLoopRequest>,
    kiosk: TicketKiosk,
    _guard: Arc<SpawnGuard>,
}

impl ClientTransportLayer {
    pub(crate) fn new(config: ClientTransportConfig) -> error_stack::Result<Self, TransportError> {
        #[cfg(target_arch = "wasm32")]
        console_error_panic_hook::set_once();

        let transport = TransportLayer::new_client(config.transport)?;

        let (tx, rx) = mpsc::channel(32);

        let cancel = CancellationToken::new();

        let event_loop = Self::event_loop(transport, config.remote, rx, cancel.child_token());

        #[cfg(not(target_arch = "wasm32"))]
        let handle = tokio::spawn(event_loop);

        #[cfg(target_arch = "wasm32")]
        wasm_bindgen_futures::spawn_local(event_loop);

        let guard = SpawnGuard {
            #[cfg(not(target_arch = "wasm32"))]
            force: Some(handle.abort_handle()),
            graceful: Some(cancel),
        };

        Ok(Self {
            tx,
            kiosk: TicketKiosk::new(),
            _guard: Arc::new(guard),
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

                context.lookup.insert(ticket, request_id);
                context.pending.insert(request_id, (ticket, tx));
            }
            EventLoopRequest::Cancel(ticket) => {
                let Some(request_id) = context.lookup.remove(&ticket) else {
                    return;
                };

                context.pending.remove(&request_id);
            }
            EventLoopRequest::Metrics(tx) => {
                let metrics = ClientTransportMetrics {
                    server_address: context.server_address.clone(),
                    server_peer_id: context.server_peer_id,

                    dialing: context.dialing,
                    pending: context.pending.len(),
                    lookup: context.lookup.len(),
                    waiting: context.waiting.len(),
                };

                if let Err(error) = tx.send(metrics) {
                    tracing::error!(?error, "failed to send metrics");
                }
            }
        }
    }

    fn handle_behaviour_event(
        event: <request_response::Behaviour<Codec> as NetworkBehaviour>::ToSwarm,
        context: &mut EventLoopContext,
    ) {
        let Event::Message { peer, message } = event else {
            return;
        };

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

    fn handle_swarm_event(
        transport: &mut TransportLayer,

        event: SwarmEvent<BehaviourCollectionEvent>,

        context: &mut EventLoopContext,
    ) {
        match event {
            SwarmEvent::Behaviour(BehaviourCollectionEvent::Protocol(event)) => {
                log_behaviour_event(&event);
                Self::handle_behaviour_event(event, context);
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

            other => {
                #[cfg(target_arch = "wasm32")]
                web_sys::console::log_1(&format!("{:?}", other).into());

                tracing::trace!(?other, "unhandled swarm event");
            }
        }
    }

    async fn event_loop(
        mut transport: TransportLayer,
        remote: Multiaddr,
        mut rx: mpsc::Receiver<EventLoopRequest>,
        cancel: CancellationToken,
    ) {
        let mut context = EventLoopContext::new(remote);

        loop {
            select! {
                _ = cancel.cancelled() => {
                    tracing::info!("event loop cancelled");
                    return;
                },
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
            .change_context(EventLoopOfflineError)
            .change_context(TransportError)?;

        rx.await
            .change_context(BrokenChannelError)
            .change_context(TransportError)
    }

    #[cfg(not(target_arch = "wasm32"))]
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
            .change_context(EventLoopOfflineError)
            .change_context(TransportError)?;

        let result = time::timeout(timeout, rx).await;

        if let Ok(result) = result {
            result
                .change_context(BrokenChannelError)
                .change_context(TransportError)
        } else {
            self.tx
                .send(EventLoopRequest::Cancel(ticket))
                .await
                .change_context(EventLoopOfflineError)
                .change_context(TransportError)?;

            Ok(Response::error(ResponseError::DeadlineExceeded))
        }
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub(crate) async fn call_with_deadline(
        &self,
        request: Request,
        deadline: Instant,
    ) -> error_stack::Result<Response, TransportError> {
        self.call_with_timeout(request, deadline - Instant::now())
            .await
    }

    pub(crate) async fn metrics(
        &self,
    ) -> error_stack::Result<ClientTransportMetrics, TransportError> {
        let (tx, rx) = oneshot::channel();

        self.tx
            .send(EventLoopRequest::Metrics(tx))
            .await
            .change_context(EventLoopOfflineError)
            .change_context(TransportError)?;

        rx.await
            .change_context(BrokenChannelError)
            .change_context(TransportError)
    }
}