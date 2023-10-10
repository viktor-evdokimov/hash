//! General types and traits used throughout the Zanzibar authorization system.

use core::fmt;
use std::{borrow::Cow, fmt::Display};

use serde::{de::DeserializeOwned, Deserialize, Serialize};

/// The relation or permission of a [`Resource`] to another [`Resource`].
pub trait Affiliation<R: Object + ?Sized>:
    Serialize + DeserializeOwned + Display + Send + Sync
{
}

/// A computed set of [`Resource`]s for another particular [`Resource`].
pub trait Permission<R: Object + ?Sized>: Affiliation<R> {}

/// Encapsulates the relationship between two [`Resource`]s.
pub trait RelationFilter<R: Object + ?Sized>: Affiliation<R> {}

/// Encapsulates the relationship between two [`Resource`]s.
pub trait Relation<R: Object + ?Sized>: Affiliation<R> {}

pub trait ObjectFilter {
    type Namespace: Serialize;
    type Id: Serialize;

    /// Returns the namespace for this `Object`.
    fn namespace(&self) -> &Self::Namespace;

    /// Returns the unique identifier for this `Object`.
    fn id(&self) -> &Self::Id;
}

pub trait Object: ObjectFilter + Sized + Send + Sync
where
    Self::Namespace: DeserializeOwned,
    Self::Id: DeserializeOwned,
{
    type Error: Display;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error>;
}

// impl<O> ObjectFilter for O
// where
//     O: Object,
// {
//     type Id = O::Id;
//     type Namespace = O::Namespace;
//
//     fn namespace(&self) -> &Self::Namespace {
//         self.namespace()
//     }
//
//     fn id(&self) -> &Self::Id {
//         self.id()
//     }
// }

impl<O: Object> Affiliation<O> for ! {}
impl<O: Object> Permission<O> for ! {}
impl<O: Object> Relation<O> for ! {}

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

pub trait Relationship: Sized + Send {
    type Error: Display;
    type Object: Object;
    type Relation: Affiliation<Self::Object>;
    type Subject: Subject;

    fn new(
        object: Self::Object,
        relation: Self::Relation,
        subject: Self::Subject,
    ) -> Result<Self, Self::Error>;

    /// Returns the underlying [`Object`] of this `Relationship`.
    fn object(&self) -> &Self::Object;

    /// Returns the [`Relation`] of this `Relationship`.
    fn relation(&self) -> &Self::Relation;

    /// Returns the [`Subject`] of this `Relationship`.
    fn subject(&self) -> &Self::Subject;
}

impl<O, R, S> Relationship for (O, R, S)
where
    O: Object,
    R: Affiliation<O>,
    S: Subject,
{
    type Error = !;
    type Object = O;
    type Relation = R;
    type Subject = S;

    fn new(
        object: Self::Object,
        relation: Self::Relation,
        subject: Self::Subject,
    ) -> Result<Self, Self::Error> {
        Ok((object, relation, subject))
    }

    fn object(&self) -> &Self::Object {
        &self.0
    }

    fn relation(&self) -> &Self::Relation {
        &self.1
    }

    fn subject(&self) -> &Self::Subject {
        &self.2
    }
}

/// Represent a unique entity that is being modelled.
///
/// `Resource`s are composed of a namespace and an unique identifier and often displayed as those
/// two values separated by a colon.
pub trait Resource {
    /// The unique identifier for this `Resource`.
    type Id: Serialize + Display;

    /// Returns the namespace for this `Resource`.
    fn namespace() -> &'static str;

    /// Returns the unique identifier for this `Resource`.
    fn id(&self) -> Self::Id;
}

/// An untyped [`Tuple`] that only holds it's string representation.
///
/// This is useful for when the tuple types are not known at compile-time, e.g. when parsing a
/// [`Tuple`] from a string.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct UntypedTuple<'t> {
    pub object_namespace: Cow<'t, str>,
    pub object_id: Cow<'t, str>,
    pub affiliation: Cow<'t, str>,
    pub user_namespace: Cow<'t, str>,
    pub user_id: Cow<'t, str>,
    pub user_set: Option<Cow<'t, str>>,
}

impl UntypedTuple<'_> {
    #[must_use]
    pub fn into_owned(self) -> UntypedTuple<'static> {
        UntypedTuple {
            object_namespace: Cow::Owned(self.object_namespace.into_owned()),
            object_id: Cow::Owned(self.object_id.into_owned()),
            affiliation: Cow::Owned(self.affiliation.into_owned()),
            user_namespace: Cow::Owned(self.user_namespace.into_owned()),
            user_id: Cow::Owned(self.user_id.into_owned()),
            user_set: self.user_set.map(|cow| Cow::Owned(cow.into_owned())),
        }
    }
}

impl fmt::Display for UntypedTuple<'_> {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            fmt,
            "{}:{}#{}@{}:{}",
            self.object_namespace,
            self.object_id,
            self.affiliation,
            self.user_namespace,
            self.user_id
        )?;
        if let Some(affiliation) = &self.user_set {
            write!(fmt, "#{affiliation}")?;
        }
        Ok(())
    }
}

// impl<'t> UntypedTuple<'t> {
//     #[must_use]
//     pub fn from_tuple<T: Tuple>(tuple: &'t T) -> Self {
//         Self {
//             object_namespace: Cow::Owned(tuple.object_namespace().to_string()),
//             object_id: Cow::Owned(tuple.object_id().to_string()),
//             affiliation: Cow::Owned(tuple.affiliation().to_string()),
//             user_namespace: Cow::Owned(tuple.user_namespace().to_string()),
//             user_id: Cow::Owned(tuple.user_id().to_string()),
//             user_set: tuple
//                 .user_set()
//                 .map(|user_set| Cow::Owned(user_set.to_string())),
//         }
//     }
// }

/// Provide causality metadata between Write and Check requests.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Zookie<'t>(Cow<'t, str>);

impl Zookie<'_> {
    pub(crate) const fn empty() -> Self {
        Self(Cow::Borrowed(""))
    }
}

/// Specifies the desired consistency level on a per-request basis.
///
/// This allows for the API consumers dynamically trade-off less fresh data for more performance
/// when possible.
#[derive(Debug, Copy, Clone)]
pub enum Consistency<'z> {
    /// Attempts to minimize the latency of the API call, using whatever caches are available.
    ///
    /// > ## Warning
    /// >
    /// > If used exclusively, this can lead to a window of time where the New Enemy Problem can
    /// > occur.
    MinimalLatency,
    /// Ensures that all data used for computing the response is at least as fresh as the
    /// point-in-time specified in the [`Zookie`].
    ///
    /// If newer information is available, it will be used.
    AtLeastAsFresh(&'z Zookie<'z>),
    /// Ensures that all data used for computing the response is that found at the exact
    /// point-in-time specified in the [`Zookie`].
    ///
    /// If the snapshot is not available, an error will be raised.
    AtExactSnapshot(&'z Zookie<'z>),
    /// Ensure that all data used is fully consistent with the latest data available within the
    /// SpiceDB datastore.
    ///
    /// Note that the snapshot used will be loaded at the beginning of the API call, and that new
    /// data written after the API starts executing will be ignored.
    ///
    /// > ## Warning
    /// >
    /// > Use of `FullyConsistent` means little caching will be available, which means performance
    /// > will suffer. Only use if a [`Zookie`] is not available or absolutely latest information
    /// > is required.
    FullyConsistent,
}
