use std::fmt::Display;

use serde::Serialize;

use crate::zanzibar::{
    types::{AffiliationFilter, RelationFilter},
    Affiliation, Object, ObjectFilter,
};

pub trait SubjectFilter {
    type Object: ObjectFilter;

    type Set: AffiliationFilter<Self::Object>;

    /// Returns the namespace for this `Object`.
    fn object(&self) -> &Self::Object;

    /// Returns the unique identifier for this `Object`.
    fn set(&self) -> Option<&Self::Set>;
}

impl SubjectFilter for ! {
    type Object = !;
    type Set = !;

    fn object(&self) -> &Self::Object {
        self
    }

    fn set(&self) -> Option<&Self::Set> {
        None
    }
}

pub trait Subject: Sized + Send + Sync {
    type Object: Object;
    type Relation: Affiliation<Self::Object>;
    type Error: Display;

    fn new(object: Self::Object, relation: Option<Self::Relation>) -> Result<Self, Self::Error>;

    /// Returns the underlying [`Object`] of this `Subject`.
    fn object(&self) -> &Self::Object;

    /// Returns the user set of this `Subject`, if any.
    fn set(&self) -> Option<&Self::Relation>;
}

impl<S: Subject> SubjectFilter for S {
    type Object = S::Object;
    type Set = S::Relation;

    fn object(&self) -> &Self::Object {
        S::object(self)
    }

    fn set(&self) -> Option<&Self::Set> {
        S::set(self)
    }
}

impl<O, R> Subject for (O, Option<R>)
where
    O: Object,
    R: Affiliation<O>,
{
    type Error = !;
    type Object = O;
    type Relation = R;

    fn new(object: Self::Object, relation: Option<Self::Relation>) -> Result<Self, Self::Error> {
        Ok((object, relation))
    }

    fn object(&self) -> &Self::Object {
        &self.0
    }

    fn set(&self) -> Option<&Self::Relation> {
        self.1.as_ref()
    }
}

impl<O> Subject for O
where
    O: Object,
{
    type Error = !;
    type Object = O;
    type Relation = !;

    fn new(object: Self::Object, _relation: Option<!>) -> Result<Self, Self::Error> {
        Ok(object)
    }

    fn object(&self) -> &Self::Object {
        self
    }

    fn set(&self) -> Option<&Self::Relation> {
        None
    }
}
