use std::{borrow::Cow, error::Error, fmt};

use graph_types::{
    account::{AccountGroupId, AccountId},
    knowledge::entity::EntityUuid,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

use crate::{
    schema::PublicAccess,
    zanzibar::{
        types::{Caveat, Relationship, Resource},
        Permission, Relation,
    },
};

#[derive(Debug, Error)]
enum InvalidSubject {
    #[error("unexpected subject for namespace")]
    Id {
        namespace: EntitySubjectNamespace,
        id: EntitySubjectId,
    },
}

#[derive(Debug, Error)]
enum InvalidRelationship {
    #[error("unexpected subject for namespace")]
    Subject {
        relation: EntityObjectRelation,
        subject: EntitySubject,
    },
    #[error("unexpected relation for namespace")]
    SubjectSet {
        relation: EntityObjectRelation,
        subject: EntitySubject,
        subject_set: Option<EntitySubjectSet>,
    },
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EntityNamespace {
    #[serde(rename = "graph/entity")]
    Entity,
}

impl Resource for EntityUuid {
    type Id = Self;
    type Namespace = EntityNamespace;

    fn from_parts(namespace: Self::Namespace, id: Self::Id) -> Result<Self, impl Error> {
        match namespace {
            EntityNamespace::Entity => Ok::<_, !>(id),
        }
    }

    fn into_parts(self) -> (Self::Namespace, Self::Id) {
        (EntityNamespace::Entity, self)
    }

    fn to_parts(&self) -> (Self::Namespace, Self::Id) {
        Resource::into_parts(*self)
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "snake_case")]
pub enum EntityObjectRelation {
    DirectOwner,
    DirectEditor,
    DirectViewer,
}

impl fmt::Display for EntityObjectRelation {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.serialize(fmt)
    }
}

impl Relation<EntityUuid> for EntityObjectRelation {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
pub struct EntityRequestedOntologyTypeContext<'c> {
    pub base_url: Cow<'c, str>,
    pub versioned_url: Cow<'c, str>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "snake_case", tag = "permission", deny_unknown_fields)]
pub enum EntityPermission<'c> {
    Update,
    View {
        #[serde(borrow)]
        context: EntityRequestedOntologyTypeContext<'c>,
    },
}

impl<'c> Permission<EntityUuid> for EntityPermission<'c> {
    type Context = EntityRequestedOntologyTypeContext<'c>;

    fn context(&self) -> Option<&Self::Context> {
        match self {
            Self::Update => None,
            Self::View { context } => Some(context),
        }
    }
}

#[derive(Debug, Default, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "snake_case")]
pub enum EntitySubjectSet {
    #[default]
    Member,
}

impl Relation<EntitySubject> for EntitySubjectSet {}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "camelCase", tag = "type", content = "id")]
pub enum EntitySubject {
    #[cfg_attr(feature = "utoipa", schema(title = "EntitySubjectPublic"))]
    Public,
    #[cfg_attr(feature = "utoipa", schema(title = "EntitySubjectAccount"))]
    Account(AccountId),
    #[cfg_attr(feature = "utoipa", schema(title = "EntitySubjectAccountGroup"))]
    AccountGroup(AccountGroupId),
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum EntitySubjectId {
    Uuid(Uuid),
    Asteriks(PublicAccess),
}

impl Resource for EntitySubject {
    type Id = EntitySubjectId;
    type Namespace = EntitySubjectNamespace;

    fn from_parts(namespace: Self::Namespace, id: Self::Id) -> Result<Self, impl Error> {
        Ok(match (namespace, id) {
            (EntitySubjectNamespace::Account, EntitySubjectId::Asteriks(PublicAccess::Public)) => {
                Self::Public
            }
            (EntitySubjectNamespace::Account, EntitySubjectId::Uuid(id)) => {
                Self::Account(AccountId::new(id))
            }
            (EntitySubjectNamespace::AccountGroup, EntitySubjectId::Uuid(id)) => {
                Self::AccountGroup(AccountGroupId::new(id))
            }
            (
                EntitySubjectNamespace::AccountGroup,
                EntitySubjectId::Asteriks(PublicAccess::Public),
            ) => {
                return Err(InvalidSubject::Id { namespace, id });
            }
        })
    }

    fn into_parts(self) -> (Self::Namespace, Self::Id) {
        match self {
            Self::Public => (
                EntitySubjectNamespace::Account,
                EntitySubjectId::Asteriks(PublicAccess::Public),
            ),
            Self::Account(id) => (
                EntitySubjectNamespace::Account,
                EntitySubjectId::Uuid(id.into_uuid()),
            ),
            Self::AccountGroup(id) => (
                EntitySubjectNamespace::AccountGroup,
                EntitySubjectId::Uuid(id.into_uuid()),
            ),
        }
    }

    fn to_parts(&self) -> (Self::Namespace, Self::Id) {
        Resource::into_parts(*self)
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "camelCase", tag = "relation")]
pub enum EntitySubjectRelation {
    Member,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
pub struct EntityProvidedOntologyTypeContext {
    pub base_urls: Vec<String>,
    pub versioned_urls: Vec<String>,
}

impl Caveat for EntityProvidedOntologyTypeContext {
    fn name(&self) -> &str {
        "ontology_type"
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "camelCase", tag = "kind", deny_unknown_fields)]
pub enum EntityDirectOwnerSubject {
    #[cfg_attr(feature = "utoipa", schema(title = "EntityDirectOwnerSubjectAccount"))]
    Account {
        #[serde(rename = "subjectId")]
        id: AccountId,
    },
    #[cfg_attr(
        feature = "utoipa",
        schema(title = "EntityDirectOwnerSubjectAccountGroup")
    )]
    AccountGroup {
        #[serde(rename = "subjectId")]
        id: AccountGroupId,
        #[serde(skip)]
        set: EntitySubjectSet,
    },
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "camelCase", tag = "kind", deny_unknown_fields)]
pub enum EntityDirectEditorSubject {
    #[cfg_attr(feature = "utoipa", schema(title = "EntityDirectEditorSubjectAccount"))]
    Account {
        #[serde(rename = "subjectId")]
        id: AccountId,
    },
    #[cfg_attr(
        feature = "utoipa",
        schema(title = "EntityDirectEditorSubjectAccountGroup")
    )]
    AccountGroup {
        #[serde(rename = "subjectId")]
        id: AccountGroupId,
        #[serde(skip)]
        set: EntitySubjectSet,
    },
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(rename_all = "camelCase", tag = "kind", deny_unknown_fields)]
pub enum EntityDirectViewerSubject {
    #[cfg_attr(feature = "utoipa", schema(title = "EntityDirectViewerSubjectPublic"))]
    Public,
    #[cfg_attr(feature = "utoipa", schema(title = "EntityDirectViewerSubjectAccount"))]
    Account {
        #[serde(rename = "subjectId")]
        id: AccountId,
    },
    #[cfg_attr(
        feature = "utoipa",
        schema(title = "EntityDirectViewerSubjectAccountGroup")
    )]
    AccountGroup {
        #[serde(rename = "subjectId")]
        id: AccountGroupId,
        #[serde(skip)]
        set: EntitySubjectSet,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
#[serde(tag = "relation")]
pub enum EntityRelationAndSubject {
    DirectOwner {
        subject: EntityDirectOwnerSubject,
    },
    DirectEditor {
        subject: EntityDirectEditorSubject,
    },
    DirectViewer {
        subject: EntityDirectViewerSubject,
        context: EntityProvidedOntologyTypeContext,
    },
}

impl EntityRelationAndSubject {
    fn from_parts(
        relation: EntityObjectRelation,
        subject: EntitySubject,
        subject_set: Option<EntitySubjectSet>,
        context: Option<EntityProvidedOntologyTypeContext>,
    ) -> Result<Self, impl Error> {
        Ok(match relation {
            EntityObjectRelation::DirectOwner => match (subject, subject_set, context) {
                (EntitySubject::Account(id), None, None) => Self::DirectOwner {
                    subject: EntityDirectOwnerSubject::Account { id },
                },
                (EntitySubject::AccountGroup(id), Some(set), None) => Self::DirectOwner {
                    subject: EntityDirectOwnerSubject::AccountGroup { id, set },
                },
                (EntitySubject::Public, ..) => {
                    return Err(InvalidRelationship::Subject { relation, subject });
                }
                (EntitySubject::Account(_) | EntitySubject::AccountGroup(_), ..) => {
                    return Err(InvalidRelationship::SubjectSet {
                        relation,
                        subject,
                        subject_set,
                    });
                }
            },
            EntityObjectRelation::DirectEditor => match (subject, subject_set, context) {
                (EntitySubject::Account(id), None, None) => Self::DirectEditor {
                    subject: EntityDirectEditorSubject::Account { id },
                },
                (EntitySubject::AccountGroup(id), Some(set), None) => Self::DirectEditor {
                    subject: EntityDirectEditorSubject::AccountGroup { id, set },
                },
                (EntitySubject::Public, ..) => {
                    return Err(InvalidRelationship::Subject { relation, subject });
                }
                (EntitySubject::Account(_) | EntitySubject::AccountGroup(_), ..) => {
                    return Err(InvalidRelationship::SubjectSet {
                        relation,
                        subject,
                        subject_set,
                    });
                }
            },
            EntityObjectRelation::DirectViewer => match (subject, subject_set, context) {
                (EntitySubject::Public, None, Some(context)) => Self::DirectViewer {
                    subject: EntityDirectViewerSubject::Public,
                    context,
                },
                (EntitySubject::Account(id), None, Some(context)) => Self::DirectViewer {
                    subject: EntityDirectViewerSubject::Account { id },
                    context,
                },
                (EntitySubject::AccountGroup(id), Some(set), Some(context)) => Self::DirectViewer {
                    subject: EntityDirectViewerSubject::AccountGroup { id, set },
                    context,
                },
                (
                    EntitySubject::Account(_)
                    | EntitySubject::AccountGroup(_)
                    | EntitySubject::Public,
                    ..,
                ) => {
                    return Err(InvalidRelationship::SubjectSet {
                        relation,
                        subject,
                        subject_set,
                    });
                }
            },
        })
    }

    const fn to_parts(
        &self,
    ) -> (
        EntityObjectRelation,
        EntitySubject,
        Option<EntitySubjectSet>,
        Option<&EntityProvidedOntologyTypeContext>,
    ) {
        let (relation, (subject, subject_set, context)) = match self {
            Self::DirectOwner { subject } => (
                EntityObjectRelation::DirectOwner,
                match subject {
                    EntityDirectOwnerSubject::Account { id } => {
                        (EntitySubject::Account(*id), None, None)
                    }
                    EntityDirectOwnerSubject::AccountGroup { id, set } => {
                        (EntitySubject::AccountGroup(*id), Some(*set), None)
                    }
                },
            ),
            Self::DirectEditor { subject } => (
                EntityObjectRelation::DirectEditor,
                match subject {
                    EntityDirectEditorSubject::Account { id } => {
                        (EntitySubject::Account(*id), None, None)
                    }
                    EntityDirectEditorSubject::AccountGroup { id, set } => {
                        (EntitySubject::AccountGroup(*id), Some(*set), None)
                    }
                },
            ),
            Self::DirectViewer { subject, context } => (
                EntityObjectRelation::DirectViewer,
                match subject {
                    EntityDirectViewerSubject::Account { id } => {
                        (EntitySubject::Account(*id), None, Some(context))
                    }
                    EntityDirectViewerSubject::AccountGroup { id, set } => {
                        (EntitySubject::AccountGroup(*id), Some(*set), Some(context))
                    }
                    EntityDirectViewerSubject::Public => {
                        (EntitySubject::Public, None, Some(context))
                    }
                },
            ),
        };
        (relation, subject, subject_set, context)
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "utoipa", derive(utoipa::ToSchema))]
pub enum EntitySubjectNamespace {
    #[serde(rename = "graph/account")]
    Account,
    #[serde(rename = "graph/account_group")]
    AccountGroup,
}

impl Relationship for (EntityUuid, EntityRelationAndSubject) {
    type Caveat = EntityProvidedOntologyTypeContext;
    type Relation = EntityObjectRelation;
    type Resource = EntityUuid;
    type Subject = EntitySubject;
    type SubjectSet = EntitySubjectSet;

    fn from_parts(
        resource: Self::Resource,
        relation: Self::Relation,
        subject: Self::Subject,
        subject_set: Option<Self::SubjectSet>,
        context: Option<Self::Caveat>,
    ) -> Result<Self, impl Error> {
        EntityRelationAndSubject::from_parts(relation, subject, subject_set, context)
            .map(|relation_and_subject| (resource, relation_and_subject))
    }

    fn to_parts(
        &self,
    ) -> (
        Self::Resource,
        Self::Relation,
        Self::Subject,
        Option<Self::SubjectSet>,
        Option<&Self::Caveat>,
    ) {
        let (resource, relationship) = self;
        let (relation, subject, subject_set, context) = relationship.to_parts();
        (*resource, relation, subject, subject_set, context)
    }
}
