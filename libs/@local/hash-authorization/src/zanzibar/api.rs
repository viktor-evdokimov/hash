use error_stack::{Result, ResultExt};
use graph_types::{
    account::{AccountGroupId, AccountId},
    knowledge::entity::EntityId,
    web::WebId,
};

use crate::{
    backend::{CheckError, CheckResponse, ModifyRelationError, ZanzibarBackend},
    schema::{AccountGroupPermission, AccountGroupSubject},
    zanzibar::{Consistency, Filter, Zookie},
    AuthorizationApi, VisibilityScope,
};

#[derive(Debug, Clone)]
pub struct ZanzibarClient<B> {
    backend: B,
}

impl<B> ZanzibarClient<B> {
    pub const fn new(backend: B) -> Self {
        Self { backend }
    }
}

impl<B: ZanzibarBackend + Send + Sync> ZanzibarClient<B> {
    async fn read_account_group_relations(
        &mut self,
        account_group: AccountGroupId,
    ) -> Result<Vec<(AccountGroupId, AccountGroupSubject)>, ModifyRelationError> {
        self.backend
            .read_relations(
                Filter::new().with_object(&account_group),
                Consistency::FullyConsistent,
            )
            .await
            .change_context(ModifyRelationError)
    }
}

impl<B> AuthorizationApi for ZanzibarClient<B>
where
    B: ZanzibarBackend + Send + Sync,
{
    async fn has_account_group_permission(
        &self,
        actor: AccountId,
        account_group: AccountGroupId,
        permission: AccountGroupPermission,
        consistency: Consistency<'_>,
    ) -> Result<CheckResponse, CheckError> {
        self.backend
            .check(&(account_group, permission, actor), consistency)
            .await
    }

    async fn add_account_group_relation(
        &mut self,
        account_group: AccountGroupId,
        relation: impl Into<AccountGroupSubject> + Send,
    ) -> Result<Zookie<'static>, ModifyRelationError> {
        Ok(self
            .backend
            .create_relations([(account_group, relation.into())])
            .await
            .change_context(ModifyRelationError)?
            .written_at)
    }

    async fn remove_account_group_relation(
        &mut self,
        account_group: AccountGroupId,
        relation: impl Into<AccountGroupSubject> + Send,
    ) -> Result<Zookie<'static>, ModifyRelationError> {
        Ok(self
            .backend
            .delete_relations([(account_group, relation.into())])
            .await
            .change_context(ModifyRelationError)?
            .deleted_at)
    }

    // async fn add_web_owner(
    //     &mut self,
    //     owner: OwnerId,
    //     web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match owner {
    //   OwnerId::Account(account) => { self.backend .create_relations([(web,
    //   WebRelation::DirectOwner, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .create_relations([( web, WebRelation::DirectOwner, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .written_at)
    // }
    //
    // async fn remove_web_owner(
    //     &mut self,
    //     owner: OwnerId,
    //     web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match owner {
    //   OwnerId::Account(account) => { self.backend .delete_relations([(web,
    //   WebRelation::DirectOwner, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .delete_relations([( web, WebRelation::DirectOwner, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .deleted_at)
    // }
    //
    // async fn add_web_editor(
    //     &mut self,
    //     editor: OwnerId,
    //     web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match editor {
    //   OwnerId::Account(account) => { self.backend .create_relations([(web,
    //   WebRelation::DirectEditor, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .create_relations([( web, WebRelation::DirectEditor, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .written_at)
    // }
    //
    // async fn remove_web_editor(
    //     &mut self,
    //     editor: OwnerId,
    //     web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match editor {
    //   OwnerId::Account(account) => { self.backend .delete_relations([(web,
    //   WebRelation::DirectEditor, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .delete_relations([( web, WebRelation::DirectEditor, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .deleted_at)
    // }
    //
    // async fn add_entity_owner(
    //     &mut self,
    //     scope: OwnerId,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope {
    //   OwnerId::Account(account) => { self.backend .create_relations([(entity.entity_uuid,
    //   EntityRelation::DirectOwner, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .create_relations([( entity.entity_uuid, EntityRelation::DirectOwner,
    //   account_group, AccountGroupPermission::Member, )]) .await } }
    //   .change_context(ModifyRelationError)? .written_at)
    // }
    //
    // async fn remove_entity_owner(
    //     &mut self,
    //     scope: OwnerId,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope {
    //   OwnerId::Account(account) => { self.backend .delete_relations([(entity.entity_uuid,
    //   EntityRelation::DirectOwner, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .delete_relations([( entity.entity_uuid, EntityRelation::DirectOwner,
    //   account_group, AccountGroupPermission::Member, )]) .await } }
    //   .change_context(ModifyRelationError)? .deleted_at)
    // }
    //
    // async fn add_entity_editor(
    //     &mut self,
    //     scope: OwnerId,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope {
    //   OwnerId::Account(account) => { self.backend .create_relations([(entity.entity_uuid,
    //   EntityRelation::DirectEditor, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .create_relations([( entity.entity_uuid, EntityRelation::DirectEditor,
    //   account_group, AccountGroupPermission::Member, )]) .await } }
    //   .change_context(ModifyRelationError)? .written_at)
    // }
    //
    // async fn remove_entity_editor(
    //     &mut self,
    //     scope: OwnerId,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope {
    //   OwnerId::Account(account) => { self.backend .delete_relations([(entity.entity_uuid,
    //   EntityRelation::DirectEditor, account)]) .await } OwnerId::AccountGroup(account_group) => {
    //   self.backend .delete_relations([( entity.entity_uuid, EntityRelation::DirectEditor,
    //   account_group, AccountGroupPermission::Member, )]) .await } }
    //   .change_context(ModifyRelationError)? .deleted_at)
    // }
    //
    // async fn add_entity_viewer(
    //     &mut self,
    //     scope: VisibilityScope,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope { VisibilityScope::Public
    //   => { self.backend .create_relations([( entity.entity_uuid, EntityRelation::DirectViewer,
    //   PublicAccess::Public, )]) .await } VisibilityScope::Account(account) => { self.backend
    //   .create_relations([(entity.entity_uuid, EntityRelation::DirectViewer, account)]) .await }
    //   VisibilityScope::AccountGroup(account_group) => { self.backend .create_relations([(
    //   entity.entity_uuid, EntityRelation::DirectViewer, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .written_at)
    // }
    //
    // async fn remove_entity_viewer(
    //     &mut self,
    //     scope: VisibilityScope,
    //     entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(match scope { VisibilityScope::Public
    //   => { self.backend .delete_relations([( entity.entity_uuid, EntityRelation::DirectViewer,
    //   PublicAccess::Public, )]) .await } VisibilityScope::Account(account) => { self.backend
    //   .delete_relations([(entity.entity_uuid, EntityRelation::DirectViewer, account)]) .await }
    //   VisibilityScope::AccountGroup(account_group) => { self.backend .delete_relations([(
    //   entity.entity_uuid, EntityRelation::DirectViewer, account_group,
    //   AccountGroupPermission::Member, )]) .await } } .change_context(ModifyRelationError)?
    //   .deleted_at)
    // }

    // async fn can_create_entity(
    //     &self,
    //     actor: AccountId,
    //     web: impl Into<WebId> + Send,
    //     consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { self.backend .check( &(web.into(),
    //   WebPermission::CreateEntity, actor), consistency, ) .await
    // }
    //
    // async fn can_update_entity(
    //     &self,
    //     actor: AccountId,
    //     entity: EntityId,
    //     consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { self.backend .check( &(entity.entity_uuid,
    //   EntityPermission::Update, actor), consistency, ) .await
    // }
    //
    // async fn can_view_entity(
    //     &self,
    //     actor: AccountId,
    //     entity: EntityId,
    //     consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { self.backend .check( &(entity.entity_uuid,
    //   EntityPermission::View, actor), consistency, ) .await
    // }
}
