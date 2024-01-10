import {
  type EntityIdWithInterval as EntityIdWithIntervalBp,
  type EntityIdWithTimestamp as EntityIdWithTimestampBp,
  type OutwardEdge as OutwardEdgeBp,
} from "@blockprotocol/graph/temporal";
import * as temporal from "@blockprotocol/graph/temporal";
import type { Subtype } from "@local/advanced-types/subtype";

import type {
  EntityId,
  LimitedTemporalBound,
  TemporalBound,
  TimeInterval,
  Timestamp,
} from "../../shared";
import type {
  KnowledgeGraphOutwardEdge,
  OntologyOutwardEdge,
} from "./variants";

/**
 * A simple tuple type which identifies an {@link Entity} by its {@link EntityId}, at a given {@link Timestamp}.
 *
 * When using this to query a {@link Subgraph}, along its variable axis, this should identify a single unique revision
 * of an {@link Entity} or possibly refer to nothing.
 */
export type EntityIdWithTimestamp = Subtype<
  EntityIdWithTimestampBp,
  {
    baseId: EntityId;
    timestamp: Timestamp;
  }
>;

/**
 * A simple tuple type which identifies an {@link Entity} by its {@link EntityId}, over a given {@link TimeInterval}.
 *
 * When using this to query a {@link Subgraph}, along its variable axis, this could return any number of revisions
 * of an {@link Entity} (including possibly returning none).
 */
export type EntityIdWithInterval = Subtype<
  EntityIdWithIntervalBp,
  {
    entityId: EntityId;
    interval: TimeInterval<LimitedTemporalBound, TemporalBound>;
  }
>;

export type OutwardEdge = Subtype<
  OutwardEdgeBp,
  OntologyOutwardEdge | KnowledgeGraphOutwardEdge
>;

// -------------------------------- Type Guards --------------------------------

export const isOntologyOutwardEdge = (
  edge: OutwardEdge,
): edge is OntologyOutwardEdge => temporal.isOntologyOutwardEdge(edge);

export const isKnowledgeGraphOutwardEdge = (
  edge: OutwardEdge,
): edge is KnowledgeGraphOutwardEdge =>
  temporal.isKnowledgeGraphOutwardEdge(edge);
