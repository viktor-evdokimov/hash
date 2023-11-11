import { sortBlockCollectionLinks } from "@local/hash-isomorphic-utils/block-collection";
import { zeroedGraphResolveDepths } from "@local/hash-isomorphic-utils/graph-queries";
import {
  blockProtocolTypes,
  systemTypes,
} from "@local/hash-isomorphic-utils/ontology-types";
import { HasSpatiallyPositionedContentProperties } from "@local/hash-isomorphic-utils/system-types/canvas";
import {
  BlockProperties,
  HasIndexedContentProperties,
} from "@local/hash-isomorphic-utils/system-types/shared";
import { TextToken } from "@local/hash-isomorphic-utils/types";
import {
  Entity,
  EntityId,
  EntityRootType,
  GraphResolveDepths,
  Subgraph,
} from "@local/hash-subgraph";
import {
  getOutgoingLinkAndTargetEntities,
  getRoots,
} from "@local/hash-subgraph/stdlib";
import {
  extractBaseUrl,
  LinkEntity,
} from "@local/hash-subgraph/type-system-patch";

import { BlockCollectionContentItem } from "../../graphql/api-types.gen";

/**
 * The depths required to fetch the contents for blocks to render, rooted at a BlockCollection
 *
 * [BlockCollection] -[1]-> [Block] -[2]-> [Block Entity] -[3]-> [Linked Entity 1] -> [Linked Entity 2]
 *
 * This also resolves _incoming_ links to the BlockCollection to a depth of 4, to allow for incoming links
 * around the block entity's linked entities. This may result in fetching so much of the graph that we are
 * better off splitting the request into two:
 *
 * 1. BlockCollection { hasLeftEntity: { incoming: 1 }, hasRightEntity: { outgoing: 1 } }
 *    - fetches all Blocks in the collection (which have the Block Entities' ids as their rightEntity)
 * 2. Block Entity[] { hasLeftEntity: { incoming: 2, outgoing: 2 }, hasRightEntity: { incoming: 2, outgoing: 2 } }
 *    - fetches the entire graph of entities at a depth of 2 around all block entities in the collection
 *
 * Equivalent to providing each block with the graph resolved to a depth of 2 around the block entity.
 * Most blocks will require at least 1 (e.g. a table entity with an attached query), and many 2
 */
export const blockCollectionContentsDepths: GraphResolveDepths = {
  ...zeroedGraphResolveDepths,
  hasLeftEntity: { incoming: 4, outgoing: 4 },
  hasRightEntity: { incoming: 4, outgoing: 4 },
};

export const blockCollectionContentsStaticVariables = {
  ...blockCollectionContentsDepths,
  includePermissions: true,
};

export const isBlockCollectionContentsEmpty = (params: {
  contents: BlockCollectionContentItem[];
}) => {
  const { contents } = params;
  if (contents.length === 0) {
    return true;
  }

  if (
    contents.length === 1 &&
    contents[0]!.rightEntity.blockChildEntity.metadata.entityTypeId ===
      systemTypes.entityType.text.entityTypeId
  ) {
    const textualContent = contents[0]!.rightEntity.blockChildEntity.properties[
      extractBaseUrl(
        blockProtocolTypes.propertyType.textualContent.propertyTypeId,
      )
    ] as TextToken[];

    return textualContent.length === 0;
  }

  return false;
};

export const getBlockCollectionContents = (params: {
  blockCollectionSubgraph: Subgraph<EntityRootType>;
  blockCollectionEntityId: EntityId;
}): BlockCollectionContentItem[] => {
  const { blockCollectionEntityId, blockCollectionSubgraph } = params;

  const blockCollection = getRoots(blockCollectionSubgraph)[0]!;
  const isCanvas =
    blockCollection.metadata.entityTypeId ===
    systemTypes.entityType.canvas.entityTypeId;

  const outgoingContentLinks = getOutgoingLinkAndTargetEntities<
    {
      linkEntity:
        | LinkEntity<HasIndexedContentProperties>[]
        | LinkEntity<HasSpatiallyPositionedContentProperties>[];
      rightEntity: Entity<BlockProperties>[];
    }[]
  >(blockCollectionSubgraph, blockCollectionEntityId)
    .filter(
      ({ linkEntity: linkEntityRevisions }) =>
        linkEntityRevisions[0] &&
        linkEntityRevisions[0].metadata.entityTypeId ===
          (isCanvas
            ? systemTypes.linkEntityType.hasSpatiallyPositionedContent
                .linkEntityTypeId
            : systemTypes.linkEntityType.hasIndexedContent.linkEntityTypeId),
    )
    .sort((a, b) =>
      sortBlockCollectionLinks(a.linkEntity[0]!, b.linkEntity[0]!),
    );

  return outgoingContentLinks.map<BlockCollectionContentItem>(
    ({
      linkEntity: containsLinkEntityRevisions,
      rightEntity: rightEntityRevisions,
    }) => {
      const rightEntity = rightEntityRevisions[0]!;

      const componentId =
        rightEntity.properties[
          "https://hash.ai/@hash/types/property-type/component-id/"
        ];

      const blockChildEntity = getOutgoingLinkAndTargetEntities(
        blockCollectionSubgraph,
        rightEntity.metadata.recordId.entityId,
      ).find(
        ({ linkEntity: linkEntityRevisions }) =>
          linkEntityRevisions[0] &&
          linkEntityRevisions[0].metadata.entityTypeId ===
            systemTypes.linkEntityType.hasData.linkEntityTypeId,
      )?.rightEntity[0];

      if (!blockChildEntity) {
        throw new Error("Error fetching block data");
      }

      return {
        linkEntity: containsLinkEntityRevisions[0]!,
        rightEntity: {
          ...rightEntity,
          blockChildEntity,
          componentId,
        },
      };
    },
  );
};