use core::fmt;
use std::borrow::Cow;

use graph_types::account::AccountId;
use serde::{Deserialize, Serialize};

use crate::zanzibar::{Object, ObjectFilter, Resource, Subject};

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
