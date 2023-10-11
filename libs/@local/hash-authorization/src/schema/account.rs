use core::fmt;
use std::{borrow::Cow, fmt::Display};

use graph_types::account::{AccountGroupId, AccountId};
use serde::{Deserialize, Serialize};

use crate::zanzibar::{Object, ObjectFilter, Relationship, Resource, Subject};

impl Relationship for Actor {
    type Object = !;
    type Relation: Affiliation<Self::Object>;

    type Error = impl Display;

    fn new(object: Self::Object, relation: Option<Self::Relation>) -> Result<Self, Self::Error>;

    /// Returns the underlying [`Object`] of this `Subject`.
    fn object(&self) -> &Self::Object;

    /// Returns the user set of this `Subject`, if any.
    fn set(&self) -> Option<&Self::Relation>;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AccountNamespace {
    #[serde(rename = "graph/account")]
    Account,
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum PublicAccess {
    #[serde(rename = "*")]
    Public,
}

impl fmt::Display for PublicAccess {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.serialize(fmt)
    }
}

impl Object for PublicAccess {
    type Error = !;
    type Id = Self;
    type Namespace = AccountNamespace;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        match namespace {
            AccountNamespace::Account => Ok(id),
        }
    }

    fn namespace(&self) -> &Self::Namespace {
        &AccountNamespace::Account
    }

    fn id(&self) -> &Self::Id {
        self
    }
}

impl Object for AccountId {
    type Error = !;
    type Id = Self;
    type Namespace = AccountNamespace;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        match namespace {
            AccountNamespace::Account => Ok(id),
        }
    }

    fn namespace(&self) -> &Self::Namespace {
        &AccountNamespace::Account
    }

    fn id(&self) -> &Self::Id {
        self
    }
}
