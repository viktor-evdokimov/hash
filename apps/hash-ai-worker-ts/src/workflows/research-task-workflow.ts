import { ResearchTaskWorkflowParams } from "@local/hash-isomorphic-utils/research-task-types";
import { ActivityInterfaceFor } from "@temporalio/workflow";

import { createAiActivities } from "../activities";
import {
  InferenceState,
  WebPage,
} from "../activities/infer-entities/inference-types";

type AiActivities = ActivityInterfaceFor<ReturnType<typeof createAiActivities>>;

const maximumNumberOfWebSearchResults = 3;

export const createResearchTaskWorkflow =
  (ctx: { aiActivities: AiActivities }) =>
  async (params: ResearchTaskWorkflowParams) => {
    const { aiActivities } = ctx;

    const { prompt, userAuthentication, webOwnerId, entityTypeIds } = params;

    /**
     * @todo: rather than use the prompt directly, use an LLM to devise
     * potentially multiple web queries for the next step.
     */

    const webSearchResults = await aiActivities.getWebSearchResultsActivity({
      query: prompt,
    });

    const aiAssistantAccountId =
      await aiActivities.getAiAssistantAccountIdActivity({
        authentication: userAuthentication,
        grantCreatePermissionForWeb: webOwnerId,
      });

    if (!aiAssistantAccountId) {
      /** @todo: return status instead */
      throw new Error("AI Assistant account not found");
    }

    const entityTypes = await aiActivities.getDereferencedEntityTypesActivity({
      entityTypeIds,
      actorId: aiAssistantAccountId,
    });

    /**
     * For each web search result, infer the relevant entities from the website.
     */
    const inferenceStatuses = await Promise.all(
      webSearchResults
        .slice(0, maximumNumberOfWebSearchResults)
        .map(async ({ url, title }) => {
          const webPageTextContent =
            await aiActivities.getTextFromWebPageActivity({ url });

          const webPage: WebPage = {
            title,
            url,
            textContent: webPageTextContent,
          };

          /** @todo: consider sharing the inference state between the web-pages, so that usage is tracked in a single place  */
          const inferenceState: InferenceState = {
            iterationCount: 1,
            inProgressEntityIds: [],
            proposedEntitySummaries: [],
            proposedEntities: [],
            resultsByTemporaryId: {},
            usage: [],
          };

          const status = await aiActivities.inferEntitiesFromWebPageActivity({
            webPage,
            entityTypes,
            inferenceState,
          });

          return status;
        }),
    );

    const proposedEntities = inferenceStatuses.flatMap(
      (status) => status.contents[0]?.proposedEntities ?? [],
    );

    return { results: proposedEntities };
  };
