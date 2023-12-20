pub(crate) mod client;
pub(crate) mod codec;
pub(crate) mod message;
pub(crate) mod server;

use std::{future::Future, time::Duration};

use error_stack::ResultExt;
use libp2p::{
    identify, noise, request_response,
    request_response::{Event, ProtocolSupport},
    swarm::NetworkBehaviour,
    tcp, yamux, StreamProtocol, Swarm, SwarmBuilder,
};
use thiserror::Error;
use tokio::task::JoinHandle;

use crate::harpc::transport::{
    codec::{Codec, CodecKind},
    message::{request::Request, response::Response, version::TransportVersion},
};

const TRANSPORT_VERSION: TransportVersion = TransportVersion::new(0x00);

type TransportBehaviour = request_response::Behaviour<Codec>;

#[derive(NetworkBehaviour)]
struct BehaviourCollection {
    protocol: TransportBehaviour,
    identify: identify::Behaviour,
}

type TransportSwarm = Swarm<BehaviourCollection>;

#[derive(Debug, Copy, Clone, Error)]
#[error("transport error")]
pub struct TransportError;

#[derive(Debug, Clone, Default)]
pub struct TransportConfig {
    pub tcp: tcp::Config,
    pub codec: Codec,
    pub behaviour: request_response::Config,
    pub idle_connection_timeout: Option<Duration>,
}

impl TransportConfig {
    pub const fn with_codec(self, codec: CodecKind) -> Self {
        Self {
            codec: Codec {
                kind: codec,
                ..self.codec
            },
            ..self
        }
    }
}

struct TransportLayer {
    swarm: TransportSwarm,
}

impl TransportLayer {
    fn new(config: TransportConfig) -> error_stack::Result<Self, TransportError> {
        let transport = SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_tcp(config.tcp, noise::Config::new, yamux::Config::default)
            .change_context(TransportError)?
            .with_behaviour(|keys| BehaviourCollection {
                protocol: request_response::Behaviour::with_codec(
                    config.codec,
                    [(StreamProtocol::new("/hash/rpc/1"), ProtocolSupport::Full)],
                    config.behaviour,
                ),
                identify: identify::Behaviour::new(identify::Config::new(
                    "/hash/rpc/1".to_owned(),
                    keys.public(),
                )),
            })
            .unwrap()
            .with_swarm_config(|swarm_config| {
                swarm_config.with_idle_connection_timeout(
                    config
                        .idle_connection_timeout
                        .unwrap_or_else(|| Duration::from_secs(10)),
                )
            })
            .build();

        Ok(Self { swarm: transport })
    }
}

pub trait RequestRouter {
    fn route(&self, request: Request) -> impl Future<Output = Response> + Send + 'static;
}

fn log_behaviour_event<TRequest, TResponse, TChannelResponse>(
    event: &Event<TRequest, TResponse, TChannelResponse>,
) {
    tracing::trace!("behaviour event received");

    match event {
        Event::Message { peer, .. } => {
            tracing::trace!(?peer, "message received");
        }
        Event::OutboundFailure {
            peer,
            request_id,
            error,
        } => {
            tracing::error!(?peer, ?request_id, ?error, "outbound failure");
        }
        Event::InboundFailure {
            peer,
            request_id,
            error,
        } => {
            tracing::error!(?peer, ?request_id, ?error, "inbound failure");
        }
        Event::ResponseSent { peer, request_id } => {
            tracing::trace!(?peer, ?request_id, "response sent");
        }
    }
}

pub(crate) struct SpawnGuard(Option<JoinHandle<!>>);

impl From<JoinHandle<!>> for SpawnGuard {
    fn from(handle: JoinHandle<!>) -> Self {
        Self(Some(handle))
    }
}

impl Drop for SpawnGuard {
    fn drop(&mut self) {
        if let Some(handle) = self.0.take() {
            handle.abort();
        }
    }
}

#[cfg(test)]
mod test {
    use std::future::{ready, Future};

    use uuid::Uuid;

    use crate::harpc::{
        procedure::ProcedureId,
        service::ServiceId,
        transport::{
            client::{ClientTransportConfig, ClientTransportLayer},
            codec::CodecKind,
            message::{
                actor::ActorId,
                request::{Request, RequestHeader},
                response::{Response, ResponseHeader, ResponsePayload},
                size::PayloadSize,
            },
            server::{ServerTransportConfig, ServerTransportLayer},
            RequestRouter, TransportConfig,
        },
    };

    #[derive(Debug, Copy, Clone)]
    struct EchoRouter;

    impl RequestRouter for EchoRouter {
        fn route(&self, request: Request) -> impl Future<Output = Response> + Send + 'static {
            ready(Response {
                header: ResponseHeader {
                    size: request.header.size,
                },
                body: ResponsePayload::Success(request.body),
            })
        }
    }

    #[derive(Debug, Copy, Clone)]
    struct DelayEchoRouter {
        delay: std::time::Duration,
    }

    impl RequestRouter for DelayEchoRouter {
        fn route(&self, request: Request) -> impl Future<Output = Response> + Send + 'static {
            let delay = self.delay;

            async move {
                tokio::time::sleep(delay).await;

                Response {
                    header: ResponseHeader {
                        size: request.header.size,
                    },
                    body: ResponsePayload::Success(request.body),
                }
            }
        }
    }

    async fn setup_router<T>(
        router: T,
        transport_config: TransportConfig,
    ) -> (ClientTransportLayer, impl Drop)
    where
        T: RequestRouter + Send + Sync + 'static,
    {
        let server_config = ServerTransportConfig {
            transport: transport_config.clone(),
            listen_on: "/ip4/0.0.0.0/tcp/0".parse().unwrap(),
        };

        let server = ServerTransportLayer::new(router, server_config).unwrap();
        let server_metrics = server.metrics();
        let guard = server.spawn().unwrap();

        // poll until active
        while !server_metrics.running().await {
            tracing::info!("waiting for server to start");
            tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        }

        let remote = server_metrics.external_address().await.unwrap();
        tracing::info!("server listening on {}", remote);

        let client_config = ClientTransportConfig {
            transport: transport_config,
            remote,
        };

        let client = ClientTransportLayer::new(client_config).unwrap();

        (client, guard)
    }

    async fn echo(transport_config: TransportConfig) -> (ClientTransportLayer, impl Drop) {
        let router = EchoRouter;
        setup_router(router, transport_config).await
    }

    async fn delay_echo(
        transport_config: TransportConfig,
        delay: std::time::Duration,
    ) -> (ClientTransportLayer, impl Drop) {
        let router = DelayEchoRouter { delay };
        setup_router(router, transport_config).await
    }

    fn request() -> Request {
        let payload = *b"hello world";

        Request {
            header: RequestHeader {
                service: ServiceId::new(0x00),
                procedure: ProcedureId::new(0x00),
                actor: ActorId(Uuid::new_v4()),
                size: PayloadSize::len(&payload),
            },
            body: payload.to_vec().into(),
        }
    }

    async fn assert_empty(client: &ClientTransportLayer) {
        let metrics = client.metrics().await.unwrap();
        assert_eq!(metrics.pending, 0);
        assert_eq!(metrics.lookup, 0);
        assert_eq!(metrics.waiting, 0);
        assert!(!metrics.dialing);
    }

    #[test_log::test(tokio::test)]
    async fn echo_binary() {
        let (client, _guard) = echo(TransportConfig::default().with_codec(CodecKind::Binary)).await;

        let request = request();
        let payload = request.body.clone();

        let response = client.call(request).await.unwrap();
        let ResponsePayload::Success(body) = response.body else {
            panic!("expected success response");
        };

        assert_eq!(&*body, payload);
        assert_empty(&client).await;
    }

    #[test_log::test(tokio::test)]
    async fn echo_text() {
        let (client, _guard) = echo(TransportConfig::default().with_codec(CodecKind::Text)).await;

        let request = request();
        let payload = request.body.clone();

        let response = client.call(request).await.unwrap();
        let ResponsePayload::Success(body) = response.body else {
            panic!("expected success response");
        };

        assert_eq!(&*body, payload);
        assert_empty(&client).await;
    }

    #[test_log::test(tokio::test)]
    async fn connect_after_timeout() {
        let (client, _guard) = echo(
            TransportConfig {
                idle_connection_timeout: Some(std::time::Duration::from_millis(100)),
                ..TransportConfig::default()
            }
            .with_codec(CodecKind::Binary),
        )
        .await;

        let request = request();
        let payload = request.body.clone();

        let response = client.call(request.clone()).await.unwrap();
        let ResponsePayload::Success(body) = response.body else {
            panic!("expected success response");
        };
        assert_eq!(&*body, payload);
        assert_empty(&client).await;

        // wait for the connection to timeout
        tokio::time::sleep(std::time::Duration::from_millis(250)).await;

        let response = client.call(request).await.unwrap();
        let ResponsePayload::Success(body) = response.body else {
            panic!("expected success response");
        };
        assert_eq!(&*body, payload);
        assert_empty(&client).await;
    }

    #[test_log::test(tokio::test)]
    async fn deadline_exceeded() {
        let (client, _guard) = delay_echo(
            TransportConfig::default(),
            std::time::Duration::from_millis(250),
        )
        .await;

        let request = request();

        let response = client
            .call_with_timeout(request, std::time::Duration::from_millis(100))
            .await
            .unwrap();

        assert_eq!(
            response,
            Response {
                header: ResponseHeader {
                    size: PayloadSize::new(0)
                },
                body: ResponsePayload::Error(
                    crate::harpc::transport::message::response::ResponseError::DeadlineExceeded
                ),
            }
        );
        assert_empty(&client).await;
    }

    #[test_log::test(tokio::test)]
    async fn deadline_not_exceeded() {
        let (client, _guard) = delay_echo(
            TransportConfig::default(),
            std::time::Duration::from_millis(100),
        )
        .await;

        let request = request();
        let payload = request.body.clone();

        let response = client
            .call_with_timeout(request, std::time::Duration::from_millis(250))
            .await
            .unwrap();

        assert_eq!(response.body, ResponsePayload::Success(payload));
        assert_empty(&client).await;
    }
}