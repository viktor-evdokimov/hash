use serde::{
    de::IntoDeserializer, ser::SerializeStruct, Deserialize, Deserializer, Serialize, Serializer,
};

use crate::zanzibar::{Object, Subject};

fn empty_string_as_none<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    match Option::<String>::deserialize(deserializer)?.as_deref() {
        None | Some("") => Ok(None),
        Some(string) => T::deserialize(string.into_deserializer()).map(Some),
    }
}

pub(crate) struct ObjectReference<'t, T>(pub(crate) &'t T);

impl<T: Object> Serialize for ObjectReference<'_, T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut serialize = serializer.serialize_struct("ObjectReference", 2)?;
        serialize.serialize_field("objectType", self.0.namespace())?;
        serialize.serialize_field("objectId", &self.0.id())?;
        serialize.end()
    }
}

#[derive(Debug)]
pub(crate) struct SubjectReference<'t, T>(pub(crate) &'t T);

impl<T: Subject> Serialize for SubjectReference<'_, T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut serialize = serializer.serialize_struct("SubjectReference", 2)?;
        serialize.serialize_field("object", &ObjectReference(self.0.object()))?;
        if let Some(relation) = self.0.set() {
            serialize.serialize_field("optionalRelation", relation)?;
        }
        serialize.end()
    }
}

pub mod object {
    use serde::{de, Deserialize, Deserializer, Serialize, Serializer};

    use crate::{backend::spicedb::serde::ObjectReference, zanzibar::Object};

    pub fn serialize<T, S>(object: &T, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Object,
        S: Serializer,
    {
        ObjectReference(object).serialize(serializer)
    }

    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<T, D::Error>
    where
        T: Object,
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct Serialized<T, I> {
            object_type: T,
            object_id: I,
        }
        let object = Serialized::<T::Namespace, T::Id>::deserialize(deserializer)?;
        T::new(object.object_type, object.object_id).map_err(de::Error::custom)
    }
}

pub mod subject {
    use serde::{de, ser::SerializeStruct, Deserialize, Deserializer, Serialize, Serializer};

    use crate::{
        backend::spicedb::serde::SubjectReference,
        zanzibar::{Affiliation, Object, Subject},
    };

    pub fn serialize<T, S>(subject: &T, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Subject,
        S: Serializer,
    {
        SubjectReference(subject).serialize(serializer)
    }

    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<T, D::Error>
    where
        T: Subject,
        D: Deserializer<'de>,
    {
        #[derive(Serialize, Deserialize)]
        #[serde(rename_all = "camelCase", bound = "O: Object, R: Affiliation<O>")]
        struct Serialized<O, R> {
            #[serde(with = "super::object")]
            object: O,
            #[serde(
                rename = "optionalRelation",
                deserialize_with = "super::empty_string_as_none"
            )]
            relation: Option<R>,
        }

        let subject = Serialized::<T::Object, T::Relation>::deserialize(deserializer)?;
        T::new(subject.object, subject.relation).map_err(de::Error::custom)
    }
}

pub mod relationship {
    use serde::{de, ser::SerializeStruct, Deserialize, Deserializer, Serialize, Serializer};

    use crate::{
        backend::spicedb::serde::{ObjectReference, SubjectReference},
        zanzibar::{Affiliation, Object, Relationship, Subject},
    };
    pub fn serialize<T, S>(relationship: &T, serializer: S) -> Result<S::Ok, S::Error>
    where
        T: Relationship,
        S: Serializer,
    {
        #[derive(Serialize)]
        #[serde(rename_all = "camelCase", bound = "")]
        struct RelationshipReference<'t, O: Object, R: Affiliation<O>, S: Subject> {
            resource: ObjectReference<'t, O>,
            relation: &'t R,
            subject: SubjectReference<'t, S>,
        }

        RelationshipReference::<T::Object, T::Relation, T::Subject> {
            resource: ObjectReference(relationship.object()),
            relation: relationship.relation(),
            subject: SubjectReference(relationship.subject()),
        }
        .serialize(serializer)
    }

    pub fn deserialize<'de, T, D>(deserializer: D) -> Result<T, D::Error>
    where
        T: Relationship,
        D: Deserializer<'de>,
    {
        #[derive(Serialize, Deserialize)]
        #[serde(
            rename_all = "camelCase",
            bound = "O: Object, R: Affiliation<O>, S: Subject"
        )]
        struct RelationshipReference<O, R, S> {
            #[serde(with = "super::object")]
            resource: O,
            relation: R,
            #[serde(with = "super::subject")]
            subject: S,
        }

        let relationship =
            RelationshipReference::<T::Object, T::Relation, T::Subject>::deserialize(deserializer)?;
        T::new(
            relationship.resource,
            relationship.relation,
            relationship.subject,
        )
        .map_err(de::Error::custom)
    }
}
