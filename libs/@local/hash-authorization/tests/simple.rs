#![feature(associated_type_bounds)]
#![allow(clippy::too_many_lines)]

mod api;
mod schema;

use std::error::Error;

use authorization::{
    backend::ZanzibarBackend,
    schema::{
        EntityDirectOwnerSubject, EntityDirectViewerSubject, EntityObjectRelation,
        EntityPermission, EntityProvidedOntologyTypeContext, EntityRelationAndSubject,
        EntityRequestedOntologyTypeContext,
    },
    zanzibar::Consistency,
};

use crate::schema::{ALICE, BOB, ENTITY_A, ENTITY_B};

#[tokio::test]
async fn plain_permissions() -> Result<(), Box<dyn Error>> {
    let mut api = api::connect();

    api.import_schema(include_str!("../schemas/v1__initial_schema.zed"))
        .await?;

    let token = api
        .touch_relationships([
            (
                ENTITY_A,
                EntityRelationAndSubject::DirectOwner {
                    subject: EntityDirectOwnerSubject::Account { id: ALICE },
                },
            ),
            (
                ENTITY_A,
                EntityRelationAndSubject::DirectViewer {
                    subject: EntityDirectViewerSubject::Account { id: BOB },
                    context: EntityProvidedOntologyTypeContext {
                        base_urls: vec!["".to_owned()],
                        versioned_urls: vec![],
                    },
                },
            ),
            (
                ENTITY_B,
                EntityRelationAndSubject::DirectOwner {
                    subject: EntityDirectOwnerSubject::Account { id: BOB },
                },
            ),
        ])
        .await?
        .written_at;

    // Test permissions
    assert!(
        api.check(
            &ENTITY_A,
            &EntityPermission::View {
                context: EntityRequestedOntologyTypeContext {
                    base_url: "",
                    versioned_url: "",
                }
            },
            &ALICE,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        !api.check(
            &ENTITY_B,
            &EntityPermission::View {
                context: EntityRequestedOntologyTypeContext {
                    base_url: "",
                    versioned_url: "",
                }
            },
            &ALICE,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        api.check(
            &ENTITY_A,
            &EntityPermission::View {
                context: EntityRequestedOntologyTypeContext {
                    base_url: "",
                    versioned_url: "",
                }
            },
            &BOB,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        api.check(
            &ENTITY_B,
            &EntityPermission::View {
                context: EntityRequestedOntologyTypeContext {
                    base_url: "",
                    versioned_url: "",
                }
            },
            &BOB,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        api.check(
            &ENTITY_A,
            &EntityPermission::Update,
            &ALICE,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        !api.check(
            &ENTITY_B,
            &EntityPermission::Update,
            &ALICE,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        !api.check(
            &ENTITY_A,
            &EntityPermission::Update,
            &BOB,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );
    assert!(
        api.check(
            &ENTITY_B,
            &EntityPermission::Update,
            &BOB,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );

    let token = api
        .delete_relationships([(ENTITY_A, EntityObjectRelation::DirectViewer, BOB)])
        .await?
        .written_at;

    assert!(
        !api.check(
            &ENTITY_A,
            &EntityPermission::View {
                context: EntityRequestedOntologyTypeContext {
                    base_url: "",
                    versioned_url: "",
                }
            },
            &BOB,
            Consistency::AtLeastAsFresh(&token)
        )
        .await?
        .has_permission
    );

    Ok(())
}
