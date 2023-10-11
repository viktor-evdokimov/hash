mod account;
pub mod account_group;
// mod entity;
// mod web;

use graph_types::account::{AccountGroupId, AccountId};

pub use self::{
    account::PublicAccess,
    account_group::{
        AccountGroupAdmin, AccountGroupMember, AccountGroupOwner, AccountGroupPermission,
        AccountGroupSubject,
    },
    // entity::{EntityPermission, EntityRelation},
    // web::{OwnerId, WebPermission, WebRelation},
};

pub enum EntityOwner {
    Account(AccountId),
    AccountGroup(AccountGroupId),
}

pub enum EntityViewer {
    Account(AccountId),
    AccountGroup(AccountGroupId),
    Public,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Actor {
    Account(AccountId),
    AccountGroupMember(AccountGroupId),
}
