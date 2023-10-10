//! General types and traits used throughout the Zanzibar authorization system.

pub use self::{
    api::ZanzibarClient,
    types::{
        Affiliation, Consistency, Object, ObjectFilter, Permission, Relation, Relationship,
        Resource, Subject, UntypedTuple, Zookie,
    },
};

mod api;
mod types;
