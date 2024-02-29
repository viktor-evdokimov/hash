import type { ResearchTaskWorkflowParams } from "@local/hash-isomorphic-utils/research-task-types";
import { OwnedById } from "@local/hash-subgraph/.";

import { genId } from "../../../util";
import {
  MutationStartResearchTaskArgs,
  ResearchTaskResult,
  ResolverFn,
} from "../../api-types.gen";
import { GraphQLContext } from "../../context";

export const startResearchTaskResolver: ResolverFn<
  Promise<ResearchTaskResult>,
  Record<string, never>,
  GraphQLContext,
  MutationStartResearchTaskArgs
> = async (_, { prompt, entityTypeIds }, graphQLContext) => {
  const { temporal, user } = graphQLContext;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const result = await temporal.workflow.execute<
    (params: ResearchTaskWorkflowParams) => Promise<unknown>
  >("researchTask", {
    taskQueue: "ai",
    args: [
      {
        prompt,
        entityTypeIds,
        userAuthentication: { actorId: user.accountId },
        webOwnerId: user.accountId as OwnedById,
      },
    ],
    workflowId: genId(),
    retry: {
      maximumAttempts: 1,
    },
  });

  return { result };
};
