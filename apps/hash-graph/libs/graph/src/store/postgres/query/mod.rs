#![allow(dead_code, reason = "Work in progress")]

//! Postgres implementation to compile queries.

mod compile;
mod condition;
mod data_type;
mod entity;
mod entity_type;
mod expression;
mod property_type;
mod statement;
mod table;

use std::{
    convert::identity,
    error::Error,
    fmt::{self, Display, Formatter},
};

use error_stack::Context;
use graph_types::knowledge::entity::Entity;
use temporal_versioning::TimeAxis;
use tokio_postgres::Row;

pub use self::{
    compile::SelectCompiler,
    condition::{Condition, EqualityOperator},
    expression::{
        Constant, Expression, Function, JoinExpression, OrderByExpression, Ordering,
        SelectExpression, WhereExpression, WithExpression,
    },
    statement::{Distinctness, SelectStatement, Statement, WindowStatement},
    table::{
        Alias, AliasedColumn, AliasedTable, Column, ForeignKeyReference, ReferenceTable, Table,
    },
};
use crate::{
    knowledge::EntityQueryPath,
    store::{
        crud::{
            CustomCursor, CustomCursorParameter, CustomSorting, CustomSortingPaths,
            QueryRecordDecode, Sorting,
        },
        postgres::query::table::Relation,
        query::{Parameter, ParameterConversionError, ParameterType, QueryPath},
        Record,
    },
    subgraph::temporal_axes::QueryTemporalAxes,
};

pub trait PostgresRecord: Record {
    /// The [`Table`] used for this `Query`.
    fn base_table() -> Table;
}

/// An absolute path inside of a query pointing to an attribute.
pub trait PostgresQueryPath {
    /// Returns a list of [`Relation`]s required to traverse this path.
    fn relations(&self) -> Vec<Relation>;

    /// The [`Column`] where this path ends.
    fn terminating_column(&self) -> Column;
}

/// Renders the object into a Postgres compatible format.
pub trait Transpile: 'static {
    /// Renders the value using the given [`Formatter`].
    fn transpile(&self, fmt: &mut Formatter) -> fmt::Result;

    fn transpile_to_string(&self) -> String {
        struct Transpiler<'a, T: ?Sized>(&'a T);
        impl<T: Transpile + ?Sized> Display for Transpiler<'_, T> {
            fn fmt(&self, fmt: &mut Formatter<'_>) -> std::fmt::Result {
                self.0.transpile(fmt)
            }
        }

        Transpiler(self).to_string()
    }
}

pub trait QueryRecordEncode {
    type CompilationParameters<'p>: Send
    where
        Self: 'p;
    type Error: Context + Send + Sync + 'static;

    fn encode(&self) -> Result<Option<Self::CompilationParameters<'_>>, Self::Error>;
}

impl<R> QueryRecordEncode for CustomSorting<'_, R>
where
    R: Record,
{
    type CompilationParameters<'p> = Vec<Parameter<'p>>
        where
            Self: 'p;
    type Error = ParameterConversionError;

    fn encode(&self) -> Result<Option<Self::CompilationParameters<'_>>, Self::Error> {
        self.cursor()
            .map(|cursor| {
                self.paths
                    .iter()
                    .zip(&cursor.values)
                    .map(|(path, value)| Parameter::from_value(value, path.expected_type()))
                    .collect()
            })
            .transpose()
    }
}

pub trait PostgresSorting<R: Record>:
    Sorting + QueryRecordEncode + QueryRecordDecode<Row, Output = Self::Cursor>
{
    fn compile<'c, 'p: 'c>(
        &self,
        compiler: &mut SelectCompiler<'c, R>,
        parameters: Option<&'c Self::CompilationParameters<'p>>,
        temporal_axes: &QueryTemporalAxes,
    ) -> Self::CompilationArtifacts;
}

impl QueryRecordDecode<Row> for CustomSorting<'_, Entity> {
    type CompilationArtifacts = Vec<usize>;
    type Output = CustomCursor;

    fn decode(row: &Row, indices: Self::CompilationArtifacts) -> Self::Output {
        indices.into_iter().map(|i| row.get(i)).collect()
    }
}

impl PostgresSorting<Entity> for CustomSorting<'_, Entity> {
    fn compile<'c, 'p: 'c>(
        &self,
        compiler: &mut SelectCompiler<'c, Entity>,
        parameters: Option<&'c Vec<Parameter<'p>>>,
        temporal_axes: &QueryTemporalAxes,
    ) -> Self::CompilationArtifacts {
        if let Some(cursor) = parameters {
            self.paths
                .iter()
                .zip(&cursor.values)
                .map(|(path, value)| {
                    let parameter = Parameter::from_value(value, path.expected_type()).expect(
                        "provided cursor parameter does not match the expected parameter type",
                    );
                    let expression = compiler.compile_parameter(&parameter).0;
                    compiler.add_cursor_selection(&path, identity, expression, Ordering::Ascending);
                })
                .collect()
        } else {
            self.paths
                .iter()
                .map(|path| {
                    compiler.add_distinct_selection_with_ordering(
                        &path,
                        Distinctness::Distinct,
                        Some(Ordering::Ascending),
                    );
                })
                .collect()
        }
    }
}

pub trait QueryRecord: Record + QueryRecordDecode<Row, Output = Self> {
    type CompilationParameters: Send + 'static;

    fn parameters() -> Self::CompilationParameters;

    fn compile<'c, 'p: 'c>(
        compiler: &mut SelectCompiler<'c, Self>,
        paths: &'p Self::CompilationParameters,
    ) -> Self::CompilationArtifacts;
}

#[cfg(test)]
mod test_helper {
    use crate::{
        ontology::DataTypeQueryPath,
        store::postgres::query::{Alias, Expression, Function, PostgresQueryPath, WindowStatement},
    };

    pub fn trim_whitespace(string: impl Into<String>) -> String {
        string
            .into()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    }

    pub fn max_version_expression() -> Expression {
        Expression::Window(
            Box::new(Expression::Function(Function::Max(Box::new(
                Expression::Column(DataTypeQueryPath::Version.terminating_column().aliased(
                    Alias {
                        condition_index: 0,
                        chain_depth: 0,
                        number: 0,
                    },
                )),
            )))),
            WindowStatement::partition_by(DataTypeQueryPath::BaseUrl.terminating_column().aliased(
                Alias {
                    condition_index: 0,
                    chain_depth: 0,
                    number: 0,
                },
            )),
        )
    }
}
