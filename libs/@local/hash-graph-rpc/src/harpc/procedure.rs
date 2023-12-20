use std::future::Future;

use const_fnv1a_hash::fnv1a_hash_str_64;

use crate::harpc::{
    transport::{
        codec::{decode::DecodeBinary, encode::EncodeBinary},
        message::{request::Request, response::Response},
    },
    Context, Decode, Encode, Stateful,
};

#[derive(
    Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, serde::Serialize, serde::Deserialize,
)]
pub struct ProcedureId(u64);

impl ProcedureId {
    #[must_use]
    pub const fn new(value: u64) -> Self {
        Self(value)
    }

    #[must_use]
    pub const fn derive(value: &str) -> Self {
        Self(fnv1a_hash_str_64(value))
    }
}

impl From<u64> for ProcedureId {
    fn from(value: u64) -> Self {
        Self(value)
    }
}

impl EncodeBinary for ProcedureId {
    async fn encode_binary<T>(&self, io: &mut T) -> std::io::Result<()>
    where
        T: tokio::io::AsyncWrite + Unpin + Send,
    {
        crate::harpc::transport::codec::encode::write_varint(self.0, io).await
    }
}

impl DecodeBinary for ProcedureId {
    async fn decode_binary<T>(
        io: &mut T,
        _: crate::harpc::transport::codec::Limit,
    ) -> std::io::Result<Self>
    where
        T: tokio::io::AsyncRead + Unpin + Send,
    {
        let value = crate::harpc::transport::codec::decode::read_varint(io).await?;
        let value = Self::new(value);

        Ok(value)
    }
}

pub trait ProcedureCall<C>
where
    C: Context,
{
    type Future: Future<Output = Response> + Send + 'static;

    type Procedure: RemoteProcedure;

    fn call(self, request: Request, context: C) -> Self::Future;
}

pub struct Handler<F, P, C> {
    handler: F,
    _context: core::marker::PhantomData<(P, C)>,
}

impl<F, P, C> Clone for Handler<F, P, C>
where
    F: Clone,
{
    fn clone(&self) -> Self {
        Self {
            handler: self.handler.clone(),
            _context: core::marker::PhantomData,
        }
    }
}

impl<F, P, C> Handler<F, P, C> {
    pub(crate) const fn new(handler: F) -> Self {
        Self {
            handler,
            _context: core::marker::PhantomData,
        }
    }
}

impl<F, P, C, Fut> ProcedureCall<C> for Handler<F, P, C>
where
    F: FnOnce(P, &C::State) -> Fut + Clone + Send + 'static,
    Fut: Future<Output = P::Response> + Send,
    P: RemoteProcedure,
    C: Context + Encode<P::Response> + Decode<P>,
{
    type Procedure = P;

    type Future = impl Future<Output = Response> + Send + 'static;

    fn call(self, request: Request, context: C) -> Self::Future {
        async move {
            let body = request.body;
            let state = context.state();

            let body = context.decode(body);
            let input = body;

            let output = (self.handler)(input, state).await;

            // TODO: async + errors
            let buffer = context.encode(output);
            Response::success(buffer)
        }
    }
}

pub trait RemoteProcedure: Send + Sync {
    type Response;

    const ID: ProcedureId;
}

#[cfg(test)]
mod test {
    use crate::harpc::{procedure::ProcedureId, transport::codec::test::assert_binary};

    assert_binary![
        binary_procedure_id_zero(ProcedureId::new(0x00), &[0x00]),
        binary_procedure_id_varint(ProcedureId::new(0x80), &[0x80, 0x01]),
    ];
}