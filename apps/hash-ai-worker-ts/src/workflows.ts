import type { EntityQueryCursor, Filter } from "@local/hash-graph-client";
import type {
  InferEntitiesCallerParams,
  InferEntitiesReturn,
} from "@local/hash-isomorphic-utils/ai-inference-types";
import { GetResultsFromCancelledInferenceRequestQuery } from "@local/hash-isomorphic-utils/ai-inference-types";
import type { ParseTextFromFileParams } from "@local/hash-isomorphic-utils/parse-text-from-file-types";
import type {
  AccountId,
  DataTypeWithMetadata,
  Entity,
  EntityTypeWithMetadata,
  PropertyTypeWithMetadata,
} from "@local/hash-subgraph";
import { CancelledFailure } from "@temporalio/common";
import {
  ActivityCancellationType,
  ActivityFailure,
  defineQuery,
  isCancellation,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import { CreateEmbeddingResponse } from "openai/resources";

import { createAiActivities, createGraphActivities } from "./activities";

const aiActivities = proxyActivities<ReturnType<typeof createAiActivities>>({
  cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
  startToCloseTimeout: "3600 second", // 1 hour
  retry: {
    maximumAttempts: 1,
  },
});

const graphActivities = proxyActivities<
  ReturnType<typeof createGraphActivities>
>({
  startToCloseTimeout: "10 second",
  retry: {
    maximumAttempts: 3,
  },
});

const getResultsFromCancelledInferenceQuery: GetResultsFromCancelledInferenceRequestQuery =
  defineQuery("getResultsFromCancelledInference");

export const inferEntities = async (params: InferEntitiesCallerParams) => {
  try {
    return await aiActivities.inferEntitiesActivity(params);
  } catch (err) {
    if (isCancellation(err) && ActivityFailure.is(err)) {
      if (
        "cause" in (err as Error) &&
        CancelledFailure.is(err.cause) &&
        typeof err.cause.details[0] === "object" &&
        err.cause.details[0] !== null &&
        "code" in err.cause.details[0]
      ) {
        const results = err.cause.details[0] as InferEntitiesReturn;

        /**
         * For some reason the `details` are not returned to the client as part of the 'CancelledFailure' error,
         * so we set up a query handler instead which the client can call for partial results when it receives a cancellation.
         *
         * @todo figure out why 'details' is not being returned in the error - @see https://temporalio.slack.com/archives/C01DKSMU94L/p1705927971571849
         */
        setHandler(getResultsFromCancelledInferenceQuery, () => results);

        throw err;
      }
    }
    throw err;
  }
};

type UpdateDataTypeEmbeddingsParams = {
  authentication: {
    actorId: AccountId;
  };
} & (
  | {
      dataTypes: DataTypeWithMetadata[];
    }
  | {
      filter: Filter;
    }
);

export const updateDataTypeEmbeddings = async (
  params: UpdateDataTypeEmbeddingsParams,
): Promise<CreateEmbeddingResponse.Usage> => {
  const temporalAxes = {
    pinned: {
      axis: "transactionTime",
      timestamp: null,
    },
    variable: {
      axis: "decisionTime",
      interval: {
        start: null,
        end: null,
      },
    },
  } as const;

  let dataTypes: DataTypeWithMetadata[];

  const usage: CreateEmbeddingResponse.Usage = {
    prompt_tokens: 0,
    total_tokens: 0,
  };

  if ("dataTypes" in params) {
    dataTypes = params.dataTypes;
  } else {
    const subgraph = await graphActivities.getDataTypesByQuery({
      authentication: params.authentication,
      query: {
        filter: params.filter,
        graphResolveDepths: {
          inheritsFrom: { outgoing: 0 },
          constrainsValuesOn: { outgoing: 0 },
          constrainsPropertiesOn: { outgoing: 0 },
          constrainsLinksOn: { outgoing: 0 },
          constrainsLinkDestinationsOn: { outgoing: 0 },
          isOfType: { outgoing: 0 },
          hasLeftEntity: { incoming: 0, outgoing: 0 },
          hasRightEntity: { incoming: 0, outgoing: 0 },
        },
        temporalAxes,
        includeDrafts: true,
      },
    });
    dataTypes = await graphActivities.getSubgraphDataTypes({
      subgraph,
    });
  }

  for (const dataType of dataTypes) {
    const generatedEmbeddings =
      await aiActivities.createDataTypeEmbeddingsActivity({
        dataType,
      });

    if (generatedEmbeddings.embeddings.length > 0) {
      await graphActivities.updateDataTypeEmbeddings({
        authentication: params.authentication,
        embeddings: generatedEmbeddings.embeddings.map((embedding) => ({
          ...embedding,
          dataTypeId: dataType.schema.$id,
        })),
        updatedAtTransactionTime:
          dataType.metadata.temporalVersioning.transactionTime.start.limit,
      });
    }

    usage.prompt_tokens += generatedEmbeddings.usage.prompt_tokens;
    usage.total_tokens += generatedEmbeddings.usage.total_tokens;
  }

  return usage;
};

type UpdatePropertyTypeEmbeddingsParams = {
  authentication: {
    actorId: AccountId;
  };
} & (
  | {
      propertyTypes: PropertyTypeWithMetadata[];
    }
  | {
      filter: Filter;
    }
);

export const updatePropertyTypeEmbeddings = async (
  params: UpdatePropertyTypeEmbeddingsParams,
): Promise<CreateEmbeddingResponse.Usage> => {
  const temporalAxes = {
    pinned: {
      axis: "transactionTime",
      timestamp: null,
    },
    variable: {
      axis: "decisionTime",
      interval: {
        start: null,
        end: null,
      },
    },
  } as const;

  let propertyTypes: PropertyTypeWithMetadata[];

  const usage: CreateEmbeddingResponse.Usage = {
    prompt_tokens: 0,
    total_tokens: 0,
  };

  if ("propertyTypes" in params) {
    propertyTypes = params.propertyTypes;
  } else {
    const subgraph = await graphActivities.getPropertyTypesByQuery({
      authentication: params.authentication,
      query: {
        filter: params.filter,
        graphResolveDepths: {
          inheritsFrom: { outgoing: 0 },
          constrainsValuesOn: { outgoing: 0 },
          constrainsPropertiesOn: { outgoing: 0 },
          constrainsLinksOn: { outgoing: 0 },
          constrainsLinkDestinationsOn: { outgoing: 0 },
          isOfType: { outgoing: 0 },
          hasLeftEntity: { incoming: 0, outgoing: 0 },
          hasRightEntity: { incoming: 0, outgoing: 0 },
        },
        temporalAxes,
        includeDrafts: true,
      },
    });
    propertyTypes = await graphActivities.getSubgraphPropertyTypes({
      subgraph,
    });
  }

  for (const propertyType of propertyTypes) {
    const generatedEmbeddings =
      await aiActivities.createPropertyTypeEmbeddingsActivity({
        propertyType,
      });

    if (generatedEmbeddings.embeddings.length > 0) {
      await graphActivities.updatePropertyTypeEmbeddings({
        authentication: params.authentication,
        embeddings: generatedEmbeddings.embeddings.map((embedding) => ({
          ...embedding,
          propertyTypeId: propertyType.schema.$id,
        })),
        updatedAtTransactionTime:
          propertyType.metadata.temporalVersioning.transactionTime.start.limit,
      });
    }

    usage.prompt_tokens += generatedEmbeddings.usage.prompt_tokens;
    usage.total_tokens += generatedEmbeddings.usage.total_tokens;
  }

  return usage;
};

type UpdateEntityTypeEmbeddingsParams = {
  authentication: {
    actorId: AccountId;
  };
} & (
  | {
      entityTypes: EntityTypeWithMetadata[];
    }
  | {
      filter: Filter;
    }
);

export const updateEntityTypeEmbeddings = async (
  params: UpdateEntityTypeEmbeddingsParams,
): Promise<CreateEmbeddingResponse.Usage> => {
  const temporalAxes = {
    pinned: {
      axis: "transactionTime",
      timestamp: null,
    },
    variable: {
      axis: "decisionTime",
      interval: {
        start: null,
        end: null,
      },
    },
  } as const;

  let entityTypes: EntityTypeWithMetadata[];

  const usage: CreateEmbeddingResponse.Usage = {
    prompt_tokens: 0,
    total_tokens: 0,
  };

  if ("entityTypes" in params) {
    entityTypes = params.entityTypes;
  } else {
    const subgraph = await graphActivities.getEntityTypesByQuery({
      authentication: params.authentication,
      query: {
        filter: params.filter,
        graphResolveDepths: {
          inheritsFrom: { outgoing: 0 },
          constrainsValuesOn: { outgoing: 0 },
          constrainsPropertiesOn: { outgoing: 0 },
          constrainsLinksOn: { outgoing: 0 },
          constrainsLinkDestinationsOn: { outgoing: 0 },
          isOfType: { outgoing: 0 },
          hasLeftEntity: { incoming: 0, outgoing: 0 },
          hasRightEntity: { incoming: 0, outgoing: 0 },
        },
        temporalAxes,
        includeDrafts: true,
      },
    });
    entityTypes = await graphActivities.getSubgraphEntityTypes({
      subgraph,
    });
  }

  for (const entityType of entityTypes) {
    const generatedEmbeddings =
      await aiActivities.createEntityTypeEmbeddingsActivity({
        entityType,
      });

    if (generatedEmbeddings.embeddings.length > 0) {
      await graphActivities.updateEntityTypeEmbeddings({
        authentication: params.authentication,
        embeddings: generatedEmbeddings.embeddings.map((embedding) => ({
          ...embedding,
          entityTypeId: entityType.schema.$id,
        })),
        updatedAtTransactionTime:
          entityType.metadata.temporalVersioning.transactionTime.start.limit,
      });
    }

    usage.prompt_tokens += generatedEmbeddings.usage.prompt_tokens;
    usage.total_tokens += generatedEmbeddings.usage.total_tokens;
  }

  return usage;
};

type UpdateEntityEmbeddingsParams = {
  authentication: {
    actorId: AccountId;
  };
} & (
  | {
      entities: Entity[];
    }
  | {
      filter: Filter;
    }
);

export const updateEntityEmbeddings = async (
  params: UpdateEntityEmbeddingsParams,
): Promise<CreateEmbeddingResponse.Usage> => {
  const temporalAxes = {
    pinned: {
      axis: "transactionTime",
      timestamp: null,
    },
    variable: {
      axis: "decisionTime",
      interval: {
        start: null,
        end: null,
      },
    },
  } as const;

  let entities: Entity[];
  let cursor: EntityQueryCursor | undefined | null = undefined;

  const usage: CreateEmbeddingResponse.Usage = {
    prompt_tokens: 0,
    total_tokens: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    if ("entities" in params) {
      entities = params.entities;
    } else {
      const queryResponse = await graphActivities.getEntitiesByQuery({
        authentication: params.authentication,
        query: {
          filter: params.filter,
          graphResolveDepths: {
            inheritsFrom: { outgoing: 0 },
            constrainsValuesOn: { outgoing: 0 },
            constrainsPropertiesOn: { outgoing: 0 },
            constrainsLinksOn: { outgoing: 0 },
            constrainsLinkDestinationsOn: { outgoing: 0 },
            isOfType: { outgoing: 0 },
            hasLeftEntity: { incoming: 0, outgoing: 0 },
            hasRightEntity: { incoming: 0, outgoing: 0 },
          },
          temporalAxes,
          includeDrafts: true,
        },
        cursor,
        limit: 100,
      });
      cursor = queryResponse.cursor;
      entities = await graphActivities.getSubgraphEntities({
        subgraph: queryResponse.subgraph,
      });
    }

    if (entities.length === 0) {
      break;
    }

    for (const entity of entities) {
      // TODO: The subgraph library does not have the required methods to do this client side so for simplicity we're
      //       just making another request here. We should add the required methods to the library and do this client
      //       side.
      const subgraph = await graphActivities.getEntityTypesByQuery({
        authentication: params.authentication,
        query: {
          filter: {
            equal: [
              { path: ["versionedUrl"] },
              { parameter: entity.metadata.entityTypeId },
            ],
          },
          graphResolveDepths: {
            inheritsFrom: { outgoing: 255 },
            constrainsValuesOn: { outgoing: 0 },
            constrainsPropertiesOn: { outgoing: 1 },
            constrainsLinksOn: { outgoing: 0 },
            constrainsLinkDestinationsOn: { outgoing: 0 },
            isOfType: { outgoing: 0 },
            hasLeftEntity: { incoming: 0, outgoing: 0 },
            hasRightEntity: { incoming: 0, outgoing: 0 },
          },
          temporalAxes,
          includeDrafts: false,
        },
      });

      const propertyTypes = await graphActivities.getSubgraphPropertyTypes({
        subgraph,
      });

      const generatedEmbeddings =
        await aiActivities.createEntityEmbeddingsActivity({
          entityProperties: entity.properties,
          propertyTypes,
        });

      if (generatedEmbeddings.embeddings.length > 0) {
        await graphActivities.updateEntityEmbeddings({
          authentication: params.authentication,
          embeddings: generatedEmbeddings.embeddings.map((embedding) => ({
            ...embedding,
            entityId: entity.metadata.recordId.entityId,
          })),
          updatedAtTransactionTime:
            entity.metadata.temporalVersioning.transactionTime.start.limit,
          updatedAtDecisionTime:
            entity.metadata.temporalVersioning.decisionTime.start.limit,
        });
      }

      usage.prompt_tokens += generatedEmbeddings.usage.prompt_tokens;
      usage.total_tokens += generatedEmbeddings.usage.total_tokens;
    }

    if (!cursor) {
      break;
    }
  }

  return usage;
};

export const updateAllEntityEmbeddings =
  async (): Promise<CreateEmbeddingResponse.Usage> => {
    const accountIds = await graphActivities.getUserAccountIds();

    const usage: CreateEmbeddingResponse.Usage = {
      prompt_tokens: 0,
      total_tokens: 0,
    };

    for (const accountId of accountIds) {
      const this_usage = await updateEntityEmbeddings({
        authentication: { actorId: accountId },
        filter: {
          all: [
            {
              // @ts-expect-error -- Support null in Path parameter in structural queries in Node
              //                     see https://linear.app/hash/issue/H-1207
              // We can skip entities for which the embeddings were already generated.
              // If a full regeneration is desired, either the database should be wiped manually or the
              // `updateEntityEmbeddings` workflow should be called manually.
              equal: [{ path: ["embedding"] }, null],
            },
            {
              // Only embeddings for non-empty properties are generated
              notEqual: [{ path: ["properties"] }, { parameter: {} }],
            },
          ],
        },
      });
      usage.prompt_tokens += this_usage.prompt_tokens;
      usage.total_tokens += this_usage.total_tokens;
    }

    return usage;
  };

export const parseTextFromFile = async (
  params: ParseTextFromFileParams,
): Promise<void> => {
  await aiActivities.parseTextFromFileActivity(params);
};
