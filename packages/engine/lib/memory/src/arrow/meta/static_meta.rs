use std::sync::Arc;

use arrow2::datatypes::Schema;

use super::conversion::{schema_to_column_hierarchy, ColumnHeirarchy};
use crate::arrow::meta::{Column, DynamicMetadata, NodeStatic};

/// The [`StaticMetadata`] struct contains information about the internal
/// representation of the Arrow arrays which is constant for the whole
/// simulation run (information which changes is stored in [`DynamicMetadata`]).
///
/// This information includes how many nodes (each Arrow array is a "node" -
/// note that some arrays have child arrays, so nodes can be nested) there are,
/// as well as how many
/// [buffers](https://arrow.apache.org/docs/format/Columnar.html#buffer-listing-for-each-layout)
/// each node has (amongst other things).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StaticMetadata {
    /// Column-level information
    column_meta: Vec<Column>,
    /// Information on whether each buffer is growable or not. This is currently not used, as all
    /// agent batch buffers get extra padding regardless of it being fixed-size. This is because
    /// agent creation/removal is applied to every buffer.
    padding_meta: Vec<bool>,
    node_meta: Vec<NodeStatic>,
    buffer_count: usize,
    node_count: usize,
}

impl StaticMetadata {
    #[must_use]
    pub fn new(
        column_meta: Vec<Column>,
        padding_meta: Vec<bool>,
        node_meta: Vec<NodeStatic>,
    ) -> StaticMetadata {
        let buffer_count = padding_meta.len();
        let node_count = column_meta.iter().fold(0, |acc, col| acc + col.node_count);
        StaticMetadata {
            column_meta,
            padding_meta,
            node_meta,
            buffer_count,
            node_count,
        }
    }

    /// Computes the "static metadata" (see the documentation for this struct
    /// for more information) for the provided [`Schema`].
    pub fn from_schema(schema: Arc<Schema>) -> Self {
        let ColumnHeirarchy {
            column_indices,
            padding_meta,
            node_meta,
        } = schema_to_column_hierarchy(schema);
        Self::new(column_indices, padding_meta, node_meta)
    }

    pub fn validate_lengths(&self, dynamic: &DynamicMetadata) -> bool {
        let base_length = dynamic.length;
        for (i, col) in self.column_meta.iter().enumerate() {
            let node = &dynamic.nodes[col.node_start];
            if node.length != base_length {
                tracing::warn!(
                    "Column {} base node does not have required length, is {}, should be {}",
                    i,
                    node.length,
                    base_length
                );
                return false;
            }
        }
        true
    }

    #[must_use]
    pub fn get_column_meta(&self) -> &Vec<Column> {
        &self.column_meta
    }

    #[must_use]
    pub fn get_padding_meta(&self) -> &Vec<bool> {
        &self.padding_meta
    }

    #[must_use]
    pub fn get_node_meta(&self) -> &Vec<NodeStatic> {
        &self.node_meta
    }

    #[must_use]
    pub fn get_buffer_count(&self) -> usize {
        self.buffer_count
    }

    #[must_use]
    pub fn get_node_count(&self) -> usize {
        self.node_count
    }
}
