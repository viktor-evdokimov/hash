#![feature(
    associated_type_bounds,
    async_fn_in_trait,
    impl_trait_in_assoc_type,
    lint_reasons,
    return_position_impl_trait_in_trait
)]
#![feature(never_type)]

pub mod backend;
pub mod schema;
pub mod zanzibar;

pub use self::api::{AccountOrPublic, AuthorizationApi, AuthorizationApiPool, VisibilityScope};

mod api;

use error_stack::Result;
use graph_types::{
    account::{AccountGroupId, AccountId},
    knowledge::entity::EntityId,
    web::WebId,
};

use crate::{
    backend::{CheckError, CheckResponse, ModifyRelationError},
    schema::{AccountGroupPermission, AccountGroupRelationship},
    zanzibar::{Consistency, Zookie},
};

#[derive(Debug, Default, Copy, Clone)]
pub struct NoAuthorization;

impl AuthorizationApi for NoAuthorization {
    async fn has_account_group_permission(
        &self,
        _actor: AccountId,
        _account_group: AccountGroupId,
        _permissions: AccountGroupPermission,
        _consistency: Consistency<'_>,
    ) -> Result<CheckResponse, CheckError> {
        Ok(CheckResponse {
            has_permission: true,
            checked_at: Zookie::empty(),
        })
    }

    async fn add_account_group_relation(
        &mut self,
        _account_group: AccountGroupId,
        _relation: impl Into<AccountGroupRelationship> + Send,
    ) -> Result<Zookie<'static>, ModifyRelationError> {
        Ok(Zookie::empty())
    }

    async fn remove_account_group_relation(
        &mut self,
        _account_group: AccountGroupId,
        _relation: impl Into<AccountGroupRelationship> + Send,
    ) -> Result<Zookie<'static>, ModifyRelationError> {
        Ok(Zookie::empty())
    }

    // async fn add_web_owner(
    //     &mut self,
    //     _owner: OwnerId,
    //     _web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn remove_web_owner(
    //     &mut self,
    //     _owner: OwnerId,
    //     _web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn add_web_editor(
    //     &mut self,
    //     _editor: OwnerId,
    //     _web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn remove_web_editor(
    //     &mut self,
    //     _editor: OwnerId,
    //     _web: WebId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }

    // async fn add_entity_owner(
    //     &mut self,
    //     _scope: OwnerId,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn remove_entity_owner(
    //     &mut self,
    //     _scope: OwnerId,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn add_entity_editor(
    //     &mut self,
    //     _scope: OwnerId,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn remove_entity_editor(
    //     &mut self,
    //     _scope: OwnerId,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn add_entity_viewer(
    //     &mut self,
    //     _scope: VisibilityScope,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn remove_entity_viewer(
    //     &mut self,
    //     _scope: VisibilityScope,
    //     _entity: EntityId,
    // ) -> Result<Zookie<'static>, ModifyRelationError> { Ok(Zookie::empty())
    // }
    //
    // async fn can_create_entity(
    //     &self,
    //     _actor: AccountId,
    //     _web: impl Into<WebId> + Send,
    //     _consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { Ok(CheckResponse { has_permission: true, checked_at:
    //   Zookie::empty(), })
    // }
    //
    // async fn can_update_entity(
    //     &self,
    //     _actor: AccountId,
    //     _entity: EntityId,
    //     _consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { Ok(CheckResponse { has_permission: true, checked_at:
    //   Zookie::empty(), })
    // }
    //
    // async fn can_view_entity(
    //     &self,
    //     _actor: AccountId,
    //     _entity: EntityId,
    //     _consistency: Consistency<'_>,
    // ) -> Result<CheckResponse, CheckError> { Ok(CheckResponse { has_permission: true, checked_at:
    //   Zookie::empty(), })
    // }
}

impl<A> AuthorizationApiPool for A
where
    A: AuthorizationApi + Clone + Send + Sync,
{
    type Api<'pool> = Self;
    type Error = std::convert::Infallible;

    async fn acquire(&self) -> Result<Self::Api<'_>, Self::Error> {
        Ok(self.clone())
    }

    async fn acquire_owned(&self) -> Result<Self::Api<'static>, Self::Error> {
        Ok(self.clone())
    }
}
