use std::fmt::Display;

use serde::Serialize;

pub trait ObjectFilter {
    type Namespace: Serialize;

    type Id: Serialize;

    /// Returns the namespace for this `Object`.
    fn namespace(&self) -> &Self::Namespace;

    /// Returns the unique identifier for this `Object`.
    fn id(&self) -> &Self::Id;
}

impl ObjectFilter for ! {
    type Id = !;
    type Namespace = !;

    fn namespace(&self) -> &Self::Namespace {
        self
    }

    fn id(&self) -> &Self::Id {
        self
    }
}

pub trait Object: ObjectFilter + Sized + Send + Sync {
    type Error: Display;

    fn new(namespace: Self::Namespace, id: Self::Id) -> Result<Self, Self::Error>;
}
