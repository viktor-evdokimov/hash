import { VersionedUrl } from "@blockprotocol/type-system";
import { AccountId, OwnedById } from "@local/hash-subgraph";

export type ResearchTaskWorkflowParams = {
  prompt: string;
  entityTypeIds: VersionedUrl[];
  userAuthentication: { actorId: AccountId };
  webOwnerId: OwnedById;
};
