use std::fmt::Display;

use serde::Serialize;

pub trait ObjectFilter {
    type Namespace: Serialize;

    type Id: Serialize;

    /// Returns the namespace for this `Object`.
    fn namespace(&self) -> &Self::Namespace;

    /// Returns the unique identifier for this `Object`.
    fn id(&self) -> Option<&Self::Id>;
}

impl ObjectFilter for ! {
    type Id = !;
    type Namespace = !;

    fn namespace(&self) -> &Self::Namespace {
        self
    }

    fn id(&self) -> Option<&Self::Id> {
        None
    }
}

pub trait Object: Sized + Send + Sync {
    type Error: Display;

    type Id: Serialize;
    type Namespace: Serialize;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error>;

    fn namespace(&self) -> &Self::Namespace;

    fn id(&self) -> &Self::Id;
}

impl<O: Object> ObjectFilter for O {
    type Id = O::Id;
    type Namespace = O::Namespace;

    fn namespace(&self) -> &Self::Namespace {
        O::namespace(self)
    }

    fn id(&self) -> Option<&Self::Id> {
        Some(O::id(self))
    }
}
