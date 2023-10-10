use std::{borrow::Cow, fmt, fmt::Display};

use graph_types::account::{AccountGroupId, AccountId};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use utoipa::ToSchema;

use crate::zanzibar::{
    types::{AffiliationFilter, RelationFilter},
    Affiliation, Object, ObjectFilter, Permission, Relation, Relationship, Resource, Subject,
};

impl Resource for AccountGroupId {
    type Id = Self;

    fn namespace() -> &'static str {
        "graph/account_group"
    }

    fn id(&self) -> Self::Id {
        *self
    }
}

impl ObjectFilter for AccountGroupId {
    type Id = Self;
    type Namespace = Cow<'static, str>;

    fn namespace(&self) -> &Self::Namespace {
        &Cow::Borrowed("graph/account_group")
    }

    fn id(&self) -> &Self::Id {
        self
    }
}

impl Object for AccountGroupId {
    type Error = !;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        todo!()
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AccountGroupOwner {
    Account(AccountId),
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AccountGroupAdmin {
    Account(AccountId),
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AccountGroupMember {
    Account(AccountId),
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountGroupRelation {
    DirectOwner,
    DirectAdmin,
    DirectMember,
}

impl Relationship for (AccountGroupId, AccountGroupRelationship) {
    type Error = !;
    type Object = AccountGroupId;
    type Relation = AccountGroupRelation;
    type Subject = AccountId;

    fn new(
        object: Self::Object,
        relation: Self::Relation,
        subject: Self::Subject,
    ) -> Result<Self, Self::Error> {
        Ok((
            object,
            match relation {
                AccountGroupRelation::DirectOwner => {
                    AccountGroupRelationship::DirectOwner(AccountGroupOwner::Account(subject))
                }
                AccountGroupRelation::DirectAdmin => {
                    AccountGroupRelationship::DirectAdmin(AccountGroupAdmin::Account(subject))
                }
                AccountGroupRelation::DirectMember => {
                    AccountGroupRelationship::DirectMember(AccountGroupMember::Account(subject))
                }
            },
        ))
    }

    fn object(&self) -> &Self::Object {
        &self.0
    }

    fn relation(&self) -> &Self::Relation {
        match self.1 {
            AccountGroupRelationship::DirectOwner(AccountGroupOwner::Account(_)) => {
                &AccountGroupRelation::DirectOwner
            }
            AccountGroupRelationship::DirectAdmin(AccountGroupAdmin::Account(_)) => {
                &AccountGroupRelation::DirectAdmin
            }
            AccountGroupRelationship::DirectMember(AccountGroupMember::Account(_)) => {
                &AccountGroupRelation::DirectMember
            }
        }
    }

    fn subject(&self) -> &Self::Subject {
        match &self.1 {
            AccountGroupRelationship::DirectOwner(AccountGroupOwner::Account(account_id)) => {
                account_id
            }
            AccountGroupRelationship::DirectAdmin(AccountGroupAdmin::Account(account_id)) => {
                account_id
            }
            AccountGroupRelationship::DirectMember(AccountGroupMember::Account(account_id)) => {
                account_id
            }
        }
    }

    // fn to_spice_db(&self) -> (Self::Object, Self::Relation, Self::Subject) {
    //     match self.1 {
    //         AccountGroupRelationship::DirectOwner(AccountGroupOwner::Account(account_id)) => {
    //             (self.0, AccountGroupRelation::DirectOwner, account_id)
    //         }
    //         AccountGroupRelationship::DirectAdmin(AccountGroupAdmin::Account(account_id)) => {
    //             (self.0, AccountGroupRelation::DirectAdmin, account_id)
    //         }
    //         AccountGroupRelationship::DirectMember(AccountGroupMember::Account(account_id)) => {
    //             (self.0, AccountGroupRelation::DirectMember, account_id)
    //         }
    //     }
    // }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountGroupRelationship {
    DirectOwner(AccountGroupOwner),
    DirectAdmin(AccountGroupAdmin),
    DirectMember(AccountGroupMember),
}

pub struct AccountGroupTuple {
    pub object: AccountGroupId,
    pub subject: AccountGroupRelationship,
}

impl From<AccountGroupOwner> for AccountGroupRelationship {
    fn from(owner: AccountGroupOwner) -> Self {
        Self::DirectOwner(owner)
    }
}

impl From<AccountGroupAdmin> for AccountGroupRelationship {
    fn from(admin: AccountGroupAdmin) -> Self {
        Self::DirectAdmin(admin)
    }
}

impl From<AccountGroupMember> for AccountGroupRelationship {
    fn from(member: AccountGroupMember) -> Self {
        Self::DirectMember(member)
    }
}

impl fmt::Display for AccountGroupRelation {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.serialize(fmt)
    }
}

impl AffiliationFilter<AccountGroupId> for AccountGroupRelation {}
impl Affiliation<AccountGroupId> for AccountGroupRelation {}
impl RelationFilter<AccountGroupId> for AccountGroupRelation {}
impl Relation<AccountGroupId> for AccountGroupRelation {}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum AccountGroupPermission {
    AddOwner,
    RemoveOwner,
    AddAdmin,
    RemoveAdmin,
    AddMember,
    RemoveMember,

    Member,
}

impl fmt::Display for AccountGroupPermission {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.serialize(fmt)
    }
}

impl AffiliationFilter<AccountGroupId> for AccountGroupPermission {}
impl Affiliation<AccountGroupId> for AccountGroupPermission {}
impl Permission<AccountGroupId> for AccountGroupPermission {}
