use std::{convert::identity, str::FromStr};

use graph_types::{
    knowledge::{
        entity::{
            Entity, EntityEditionProvenanceMetadata, EntityId, EntityMetadata,
            EntityProvenanceMetadata, EntityRecordId, EntityUuid,
        },
        link::{EntityLinkOrder, LinkData},
    },
    owned_by_id::OwnedById,
};
use temporal_versioning::{
    ClosedTemporalBound, LeftClosedTemporalInterval, TemporalTagged, TimeAxis,
};
use tokio_postgres::Row;
use type_system::url::VersionedUrl;
use uuid::Uuid;

use crate::{
    knowledge::EntityQueryPath,
    ontology::EntityTypeQueryPath,
    store::{
        crud::{QueryRecordDecode, VertexIdSorting},
        postgres::query::{
            Distinctness, Expression, Function, Ordering, PostgresSorting, QueryRecord,
            QueryRecordEncode, SelectCompiler,
        },
        query::Parameter,
    },
    subgraph::{
        edges::{EdgeDirection, KnowledgeGraphEdgeKind, SharedEdgeKind},
        identifier::EntityVertexId,
        temporal_axes::{QueryTemporalAxes, VariableAxis},
    },
};

#[derive(Debug, Copy, Clone)]
pub struct EntityVertexIdIndices {
    pub owned_by_id: usize,
    pub entity_uuid: usize,
    pub revision_id: usize,
}

pub struct EntityVertexIdCursorParameters<'p> {
    owned_by_id: Parameter<'p>,
    entity_uuid: Parameter<'p>,
    revision_id: Parameter<'p>,
}

impl QueryRecordEncode for EntityVertexId {
    type CompilationParameters<'p> = EntityVertexIdCursorParameters<'p>;

    fn encode(&self) -> Self::CompilationParameters<'_> {
        EntityVertexIdCursorParameters {
            owned_by_id: Parameter::Uuid(self.base_id.owned_by_id.into_uuid()),
            entity_uuid: Parameter::Uuid(self.base_id.entity_uuid.into_uuid()),
            revision_id: Parameter::Timestamp(self.revision_id.cast()),
        }
    }
}

impl QueryRecordDecode<Row> for VertexIdSorting<Entity> {
    type CompilationArtifacts = EntityVertexIdIndices;
    type Output = EntityVertexId;

    fn decode(row: &Row, indices: Self::CompilationArtifacts) -> Self::Output {
        let ClosedTemporalBound::Inclusive(revision_id) = *row
            .get::<_, LeftClosedTemporalInterval<VariableAxis>>(indices.revision_id)
            .start();
        EntityVertexId {
            base_id: EntityId {
                owned_by_id: row.get(indices.owned_by_id),
                entity_uuid: row.get(indices.entity_uuid),
            },
            revision_id,
        }
    }
}

impl PostgresSorting<Entity> for VertexIdSorting<Entity> {
    fn compile<'c, 'p: 'c>(
        compiler: &mut SelectCompiler<'c, Entity>,
        parameters: Option<&'c EntityVertexIdCursorParameters<'p>>,
        temporal_axes: &QueryTemporalAxes,
    ) -> Self::CompilationArtifacts {
        let revision_id_path = match temporal_axes.variable_time_axis() {
            TimeAxis::TransactionTime => &EntityQueryPath::TransactionTime,
            TimeAxis::DecisionTime => &EntityQueryPath::DecisionTime,
        };

        if let Some(parameters) = parameters {
            // We already had a cursor, add them as parameters:
            let owned_by_id_expression = compiler.compile_parameter(&parameters.owned_by_id).0;
            let entity_uuid_expression = compiler.compile_parameter(&parameters.entity_uuid).0;
            let revision_id_expression = compiler.compile_parameter(&parameters.revision_id).0;

            EntityVertexIdIndices {
                owned_by_id: compiler.add_cursor_selection(
                    &EntityQueryPath::OwnedById,
                    identity,
                    owned_by_id_expression,
                    Ordering::Ascending,
                ),
                entity_uuid: compiler.add_cursor_selection(
                    &EntityQueryPath::Uuid,
                    identity,
                    entity_uuid_expression,
                    Ordering::Ascending,
                ),
                revision_id: compiler.add_cursor_selection(
                    revision_id_path,
                    |column| Expression::Function(Function::Lower(Box::new(column))),
                    revision_id_expression,
                    Ordering::Descending,
                ),
            }
        } else {
            EntityVertexIdIndices {
                owned_by_id: compiler.add_distinct_selection_with_ordering(
                    &EntityQueryPath::OwnedById,
                    Distinctness::Distinct,
                    Some(Ordering::Ascending),
                ),
                entity_uuid: compiler.add_distinct_selection_with_ordering(
                    &EntityQueryPath::Uuid,
                    Distinctness::Distinct,
                    Some(Ordering::Ascending),
                ),
                revision_id: compiler.add_distinct_selection_with_ordering(
                    revision_id_path,
                    Distinctness::Distinct,
                    Some(Ordering::Descending),
                ),
            }
        }
    }
}

#[derive(Debug, Copy, Clone)]
pub struct EntityRecordRowIndices {
    pub owned_by_id: usize,
    pub entity_uuid: usize,
    pub transaction_time: usize,
    pub decision_time: usize,

    pub edition_id: usize,
    pub type_id: usize,

    pub properties: usize,

    pub left_entity_uuid: usize,
    pub left_entity_owned_by_id: usize,
    pub right_entity_uuid: usize,
    pub right_entity_owned_by_id: usize,
    pub left_to_right_order: usize,
    pub right_to_left_order: usize,

    pub created_by_id: usize,
    pub created_at_transaction_time: usize,
    pub created_at_decision_time: usize,
    pub edition_created_by_id: usize,

    pub archived: usize,
    pub draft: usize,
}

pub struct EntityRecordPaths<'q> {
    pub left_entity_uuid: EntityQueryPath<'q>,
    pub left_owned_by_id: EntityQueryPath<'q>,
    pub right_entity_uuid: EntityQueryPath<'q>,
    pub right_owned_by_id: EntityQueryPath<'q>,
}

impl Default for EntityRecordPaths<'_> {
    fn default() -> Self {
        Self {
            left_entity_uuid: EntityQueryPath::EntityEdge {
                edge_kind: KnowledgeGraphEdgeKind::HasLeftEntity,
                path: Box::new(EntityQueryPath::Uuid),
                direction: EdgeDirection::Outgoing,
            },
            left_owned_by_id: EntityQueryPath::EntityEdge {
                edge_kind: KnowledgeGraphEdgeKind::HasLeftEntity,
                path: Box::new(EntityQueryPath::OwnedById),
                direction: EdgeDirection::Outgoing,
            },
            right_entity_uuid: EntityQueryPath::EntityEdge {
                edge_kind: KnowledgeGraphEdgeKind::HasRightEntity,
                path: Box::new(EntityQueryPath::Uuid),
                direction: EdgeDirection::Outgoing,
            },
            right_owned_by_id: EntityQueryPath::EntityEdge {
                edge_kind: KnowledgeGraphEdgeKind::HasRightEntity,
                path: Box::new(EntityQueryPath::OwnedById),
                direction: EdgeDirection::Outgoing,
            },
        }
    }
}

impl QueryRecordDecode<Row> for Entity {
    type CompilationArtifacts = EntityRecordRowIndices;
    type Output = Self;

    fn decode(row: &Row, indices: Self::CompilationArtifacts) -> Self {
        let entity_type_id = VersionedUrl::from_str(row.get(indices.type_id))
            .expect("Malformed entity type ID returned from Postgres");

        let link_data = {
            let left_owned_by_id: Option<Uuid> = row.get(indices.left_entity_owned_by_id);
            let left_entity_uuid: Option<Uuid> = row.get(indices.left_entity_uuid);
            let right_owned_by_id: Option<Uuid> = row.get(indices.right_entity_owned_by_id);
            let right_entity_uuid: Option<Uuid> = row.get(indices.right_entity_uuid);
            match (
                left_owned_by_id,
                left_entity_uuid,
                right_owned_by_id,
                right_entity_uuid,
            ) {
                (
                    Some(left_owned_by_id),
                    Some(left_entity_uuid),
                    Some(right_owned_by_id),
                    Some(right_entity_uuid),
                ) => Some(LinkData {
                    left_entity_id: EntityId {
                        owned_by_id: OwnedById::new(left_owned_by_id),
                        entity_uuid: EntityUuid::new(left_entity_uuid),
                    },
                    right_entity_id: EntityId {
                        owned_by_id: OwnedById::new(right_owned_by_id),
                        entity_uuid: EntityUuid::new(right_entity_uuid),
                    },
                    order: EntityLinkOrder {
                        left_to_right: row.get(indices.left_to_right_order),
                        right_to_left: row.get(indices.right_to_left_order),
                    },
                }),
                (None, None, None, None) => None,
                _ => unreachable!(
                    "It's not possible to have a link entity with the left entityId or right \
                     entityId unspecified"
                ),
            }
        };

        let entity_id = EntityId {
            owned_by_id: row.get(indices.owned_by_id),
            entity_uuid: row.get(indices.entity_uuid),
        };

        if let Ok(distance) = row.try_get::<_, f64>("distance") {
            tracing::trace!(%entity_id, %distance, "Entity embedding was calculated");
        }

        Self {
            properties: row.get(indices.properties),
            link_data,
            metadata: EntityMetadata {
                record_id: EntityRecordId {
                    entity_id,
                    edition_id: row.get(indices.edition_id),
                },
                temporal_versioning: graph_types::knowledge::entity::EntityTemporalMetadata {
                    decision_time: row.get(indices.decision_time),
                    transaction_time: row.get(indices.transaction_time),
                },
                entity_type_id,
                provenance: EntityProvenanceMetadata {
                    created_by_id: row.get(indices.created_by_id),
                    created_at_transaction_time: row.get(indices.created_at_transaction_time),
                    created_at_decision_time: row.get(indices.created_at_decision_time),
                    edition: EntityEditionProvenanceMetadata {
                        created_by_id: row.get(indices.edition_created_by_id),
                    },
                },
                archived: row.get(indices.archived),
                draft: row.get(indices.draft),
            },
        }
    }
}

impl QueryRecord for Entity {
    type CompilationParameters = EntityRecordPaths<'static>;

    fn parameters() -> Self::CompilationParameters {
        EntityRecordPaths::default()
    }

    fn compile<'c, 'p: 'c>(
        compiler: &mut SelectCompiler<'c, Self>,
        paths: &'p Self::CompilationParameters,
    ) -> Self::CompilationArtifacts {
        EntityRecordRowIndices {
            owned_by_id: compiler.add_distinct_selection_with_ordering(
                &EntityQueryPath::OwnedById,
                Distinctness::Distinct,
                None,
            ),
            entity_uuid: compiler.add_distinct_selection_with_ordering(
                &EntityQueryPath::Uuid,
                Distinctness::Distinct,
                None,
            ),
            transaction_time: compiler.add_distinct_selection_with_ordering(
                &EntityQueryPath::TransactionTime,
                Distinctness::Distinct,
                None,
            ),
            decision_time: compiler.add_distinct_selection_with_ordering(
                &EntityQueryPath::DecisionTime,
                Distinctness::Distinct,
                None,
            ),

            edition_id: compiler.add_selection_path(&EntityQueryPath::EditionId),
            type_id: compiler.add_selection_path(&EntityQueryPath::EntityTypeEdge {
                edge_kind: SharedEdgeKind::IsOfType,
                path: EntityTypeQueryPath::VersionedUrl,
                inheritance_depth: Some(0),
            }),

            properties: compiler.add_selection_path(&EntityQueryPath::Properties(None)),

            left_entity_uuid: compiler.add_selection_path(&paths.left_entity_uuid),
            left_entity_owned_by_id: compiler.add_selection_path(&paths.left_owned_by_id),
            right_entity_uuid: compiler.add_selection_path(&paths.right_entity_uuid),
            right_entity_owned_by_id: compiler.add_selection_path(&paths.right_owned_by_id),
            left_to_right_order: compiler.add_selection_path(&EntityQueryPath::LeftToRightOrder),
            right_to_left_order: compiler.add_selection_path(&EntityQueryPath::RightToLeftOrder),

            created_by_id: compiler.add_selection_path(&EntityQueryPath::CreatedById),
            created_at_transaction_time: compiler
                .add_selection_path(&EntityQueryPath::CreatedAtTransactionTime),
            created_at_decision_time: compiler
                .add_selection_path(&EntityQueryPath::CreatedAtDecisionTime),
            edition_created_by_id: compiler
                .add_selection_path(&EntityQueryPath::EditionCreatedById),

            archived: compiler.add_selection_path(&EntityQueryPath::Archived),
            draft: compiler.add_selection_path(&EntityQueryPath::Draft),
        }
    }
}
