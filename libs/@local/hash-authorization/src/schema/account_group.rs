use std::{borrow::Cow, fmt, fmt::Display};

use graph_types::account::{AccountGroupId, AccountId};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use utoipa::ToSchema;

use crate::zanzibar::{
    types::{AffiliationFilter, RelationFilter},
    Affiliation, Object, ObjectFilter, Permission, Relation, Relationship, Resource, Subject,
};

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AccountGroupNamespace {
    #[serde(rename = "graph/account_group")]
    AccountGroup,
}

impl Object for AccountGroupId {
    type Error = !;
    type Id = Self;
    type Namespace = AccountGroupNamespace;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        match namespace {
            AccountGroupNamespace::AccountGroup => Ok(id),
        }
    }

    fn namespace(&self) -> &Self::Namespace {
        &AccountGroupNamespace::AccountGroup
    }

    fn id(&self) -> &Self::Id {
        self
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
enum AccountGroupRelation {
    DirectOwner,
    DirectAdmin,
    DirectMember,
}

impl Relationship for (AccountGroupId, AccountGroupSubject) {
    type Error = !;
    type Object = AccountGroupId;
    type Subject = AccountGroupSubject;

    type Relation = impl Relation<Self::Object> + Serialize + DeserializeOwned;

    fn from_tuple(
        object: Self::Object,
        relation: Self::Relation,
        subject: Self::Subject,
    ) -> Result<Self, Self::Error> {
        Ok((
            object,
            match relation {
                AccountGroupRelation::DirectOwner => {
                    AccountGroupSubject::DirectOwner(AccountGroupOwner::Account(subject))
                }
                AccountGroupRelation::DirectAdmin => {
                    AccountGroupSubject::DirectAdmin(AccountGroupAdmin::Account(subject))
                }
                AccountGroupRelation::DirectMember => {
                    AccountGroupSubject::DirectMember(AccountGroupMember::Account(subject))
                }
            },
        ))
    }

    fn as_tuple(&self) -> (&Self::Object, &Self::Relation, &Self::Subject) {
        match &self.1 {
            AccountGroupSubject::DirectOwner(AccountGroupOwner::Account(account_id)) => (
                self.object(),
                &AccountGroupRelation::DirectOwner,
                account_id,
            ),
            AccountGroupSubject::DirectAdmin(AccountGroupAdmin::Account(account_id)) => (
                self.object(),
                &AccountGroupRelation::DirectAdmin,
                account_id,
            ),
            AccountGroupSubject::DirectMember(AccountGroupMember::Account(account_id)) => (
                self.object(),
                &AccountGroupRelation::DirectMember,
                account_id,
            ),
        }
    }

    fn object(&self) -> &Self::Object {
        &self.0
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountGroupSubject {
    DirectOwner(AccountGroupOwner),
    DirectAdmin(AccountGroupAdmin),
    DirectMember(AccountGroupMember),
}

impl Object for AccountGroupSubject {
    type Error = !;
    type Id = ;
    type Namespace = AccountGroupNamespace;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error> {
        todo!()
    }

    fn namespace(&self) -> &Self::Namespace {
        &AccountGroupNamespace::AccountGroup
    }

    fn id(&self) -> &Self::Id {
        todo!()
    }
}

pub struct AccountGroupTuple {
    pub object: AccountGroupId,
    pub subject: AccountGroupSubject,
}

impl From<AccountGroupOwner> for AccountGroupSubject {
    fn from(owner: AccountGroupOwner) -> Self {
        Self::DirectOwner(owner)
    }
}

impl From<AccountGroupAdmin> for AccountGroupSubject {
    fn from(admin: AccountGroupAdmin) -> Self {
        Self::DirectAdmin(admin)
    }
}

impl From<AccountGroupMember> for AccountGroupSubject {
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
