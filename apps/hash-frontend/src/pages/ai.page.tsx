import { useMutation } from "@apollo/client";
import { TextField } from "@hashintel/design-system";
import { EntityTypeWithMetadata } from "@local/hash-subgraph";
import { Box } from "@mui/material";
import { NextSeo } from "next-seo";
import { FormEvent, useCallback, useState } from "react";

import {
  StartResearchTaskMutation,
  StartResearchTaskMutationVariables,
} from "../graphql/api-types.gen";
import { startResearchTaskMutation } from "../graphql/queries/knowledge/entity.queries";
import { getLayoutWithSidebar, NextPageWithLayout } from "../shared/layout";
import { Button } from "../shared/ui";
import { EntityTypeSelector } from "./shared/entity-type-selector";
import { TopContextBar } from "./shared/top-context-bar";

const AiPage: NextPageWithLayout = () => {
  const [startResearchTask] = useMutation<
    StartResearchTaskMutation,
    StartResearchTaskMutationVariables
  >(startResearchTaskMutation);

  const [entityType, setEntityType] = useState<EntityTypeWithMetadata>();
  const [prompt, setPrompt] = useState<string>("");

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      console.log("handle submit");
      console.log({ entityType, prompt });
      if (entityType && prompt) {
        console.log("Starting research task...");
        void startResearchTask({
          variables: {
            entityTypeIds: [entityType.schema.$id],
            prompt,
          },
        }).then(console.log);
      }
    },
    [entityType, prompt, startResearchTask],
  );

  return (
    <>
      <NextSeo title="AI" />
      <TopContextBar
        defaultCrumbIcon={null}
        crumbs={[
          {
            title: "AI",
            id: "ai",
            icon: null,
          },
        ]}
      />
      <Box component="form" onSubmit={handleSubmit}>
        <EntityTypeSelector
          onSelect={(selectedEntityType) => setEntityType(selectedEntityType)}
          disableCreateNewEmpty
        />
        <TextField
          label="Look for...  e.g. specific things to include, focus on, or pay attention to"
          value={prompt}
          onChange={({ target }) => setPrompt(target.value)}
        />
        <Button type="submit">Start Research Task</Button>
      </Box>
    </>
  );
};

AiPage.getLayout = (page) =>
  getLayoutWithSidebar(page, {
    fullWidth: true,
  });

export default AiPage;
