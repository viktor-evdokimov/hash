CREATE TABLE IF NOT EXISTS
  ontology_ids (
    "ontology_id" UUID PRIMARY KEY,
    "base_uri" TEXT NOT NULL,
    "version" BIGINT NOT NULL,
    "transaction_time" tstzrange NOT NULL,
    UNIQUE ("base_uri", "version"),
    CONSTRAINT ontology_ids_overlapping EXCLUDE USING gist (
      base_uri
      WITH
        =,
        transaction_time
      WITH
        &&
    ) DEFERRABLE INITIALLY IMMEDIATE
  );

COMMENT
  ON TABLE ontology_ids IS $pga$ This table is a boundary to define the actual identification scheme for our kinds of types. Assume that we use the UUIDs on the types to look up more specific ID details. $pga$;

CREATE TABLE IF NOT EXISTS
  "ontology_owned_metadata" (
    "ontology_id" UUID NOT NULL,
    "owned_by_id" UUID NOT NULL REFERENCES "accounts",
    "record_created_by_id" UUID NOT NULL REFERENCES "accounts",
    CONSTRAINT ontology_owned_metadata_pk PRIMARY KEY ("ontology_id") DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT ontology_owned_metadata_fk FOREIGN KEY ("ontology_id") REFERENCES ontology_ids DEFERRABLE INITIALLY IMMEDIATE
  );

CREATE TABLE IF NOT EXISTS
  "data_types" (
    "ontology_id" UUID PRIMARY KEY REFERENCES ontology_ids,
    "schema" JSONB NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "property_types" (
    "ontology_id" UUID PRIMARY KEY REFERENCES ontology_ids,
    "schema" JSONB NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "entity_types" (
    "ontology_id" UUID PRIMARY KEY REFERENCES ontology_ids,
    "schema" JSONB NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "property_type_property_type_references" (
    "source_property_type_ontology_id" UUID NOT NULL REFERENCES "property_types",
    "target_property_type_ontology_id" UUID NOT NULL REFERENCES "property_types"
  );

CREATE TABLE IF NOT EXISTS
  "property_type_data_type_references" (
    "source_property_type_ontology_id" UUID NOT NULL REFERENCES "property_types",
    "target_data_type_ontology_id" UUID NOT NULL REFERENCES "data_types"
  );

CREATE TABLE IF NOT EXISTS
  "entity_type_property_type_references" (
    "source_entity_type_ontology_id" UUID NOT NULL REFERENCES "entity_types",
    "target_property_type_ontology_id" UUID NOT NULL REFERENCES "property_types"
  );

CREATE TABLE IF NOT EXISTS
  "entity_type_entity_type_references" (
    "source_entity_type_ontology_id" UUID NOT NULL REFERENCES "entity_types",
    "target_entity_type_ontology_id" UUID NOT NULL REFERENCES "entity_types"
  );