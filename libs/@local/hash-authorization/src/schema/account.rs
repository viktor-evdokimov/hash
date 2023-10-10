use std::borrow::Cow;

use graph_types::account::AccountId;
use serde::{Deserialize, Serialize};

use crate::zanzibar::{Object, ObjectFilter, Resource, Subject};

impl Resource for AccountId {
    type Id = Self;

    fn namespace() -> &'static str {
        "graph/account"
    }

    fn id(&self) -> Self::Id {
        *self
    }
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum PublicAccess {
    #[serde(rename = "*")]
    Public,
}

impl Resource for PublicAccess {
    type Id = &'static str;

    fn namespace() -> &'static str {
        "graph/account"
    }

    fn id(&self) -> Self::Id {
        "*"
    }
}

impl ObjectFilter for AccountId {
    type Id = Self;
    type Namespace = Cow<'static, str>;

    fn namespace(&self) -> &Self::Namespace {
        &Cow::Borrowed("graph/account")
    }

    fn id(&self) -> &Self::Id {
        self
    }
}

impl Object for AccountId {
    type Error = !;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        Ok(id)
    }
}
