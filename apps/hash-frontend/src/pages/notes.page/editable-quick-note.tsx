import { useMutation, useQuery } from "@apollo/client";
import { IconButton } from "@hashintel/design-system";
import { getBlockCollectionResolveDepth } from "@local/hash-isomorphic-utils/block-collection";
import { isHashTextBlock } from "@local/hash-isomorphic-utils/blocks";
import { zeroedGraphResolveDepths } from "@local/hash-isomorphic-utils/graph-queries";
import { getEntityQuery } from "@local/hash-isomorphic-utils/graphql/queries/entity.queries";
import {
  blockProtocolPropertyTypes,
  systemEntityTypes,
} from "@local/hash-isomorphic-utils/ontology-type-ids";
import { QuickNoteProperties } from "@local/hash-isomorphic-utils/system-types/quicknote";
import { TextToken } from "@local/hash-isomorphic-utils/types";
import {
  BaseUrl,
  Entity,
  EntityRootType,
  extractEntityUuidFromEntityId,
  OwnedById,
  Subgraph,
} from "@local/hash-subgraph";
import { Box, Fade, Skeleton, Tooltip, Typography } from "@mui/material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { useBlockProtocolUpdateEntity } from "../../components/hooks/block-protocol-functions/knowledge/use-block-protocol-update-entity";
import { useAccountPages } from "../../components/hooks/use-account-pages";
import {
  ArchiveEntityMutation,
  ArchiveEntityMutationVariables,
  BlockCollectionContentItem,
  GetEntityQuery,
  GetEntityQueryVariables,
} from "../../graphql/api-types.gen";
import { archiveEntityMutation } from "../../graphql/queries/knowledge/entity.queries";
import { constructPageRelativeUrl } from "../../lib/routes";
import { ArchiveRegularIcon } from "../../shared/icons/achive-regular-icon";
import { ArrowUpRightRegularIcon } from "../../shared/icons/arrow-up-right-regular-icon";
import { FileExportRegularIcon } from "../../shared/icons/file-export-regular-icon";
import { NoteStickyRegularIcon } from "../../shared/icons/note-sticky-regular-icon";
import { UndoRegularIcon } from "../../shared/icons/undo-regular-icon";
import { Link } from "../../shared/ui";
import { useAuthenticatedUser } from "../shared/auth-info-context";
import { BlockCollection } from "../shared/block-collection/block-collection";
import { getBlockCollectionContents } from "../shared/block-collection-contents";
import {
  ConvertQuickNoteToPageModal,
  PageWithParentLink,
} from "./convert-quick-note-to-page-modal";

const Statistic: FunctionComponent<{ amount?: number; unit: string }> = ({
  amount,
  unit,
}) => (
  <Typography
    sx={{
      color: ({ palette }) => palette.gray[50],
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      span: { color: ({ palette }) => palette.gray[70] },
    }}
  >
    <Box component="span">{amount}</Box> {unit}
    {!amount || amount === 0 || amount > 1 ? "s" : ""}
  </Typography>
);

const parseTextFromTextBlock = ({
  rightEntity,
}: BlockCollectionContentItem) => {
  const textTokens = rightEntity.blockChildEntity.properties[
    blockProtocolPropertyTypes.textualContent.propertyTypeBaseUrl as BaseUrl
  ] as TextToken[] | undefined;

  return (
    textTokens?.reduce(
      (prevText, current) =>
        current.tokenType === "text" ? `${prevText}${current.text}` : prevText,
      "",
    ) ?? ""
  );
};

export const EditableQuickNote: FunctionComponent<{
  displayLabel?: boolean;
  displayActionButtons?: boolean;
  quickNoteEntity: Entity;
  quickNoteSubgraph?: Subgraph<EntityRootType>;
  refetchQuickNotes?: () => Promise<void>;
  autoFocus?: boolean;
}> = ({
  displayLabel = true,
  displayActionButtons = true,
  quickNoteEntity,
  quickNoteSubgraph,
  refetchQuickNotes,
  autoFocus = false,
}) => {
  const { authenticatedUser } = useAuthenticatedUser();

  const [archiveEntity] = useMutation<
    ArchiveEntityMutation,
    ArchiveEntityMutationVariables
  >(archiveEntityMutation);

  const [convertedPage, setConvertedPage] = useState<PageWithParentLink>();
  const [isConvertingPage, setIsConvertingPage] = useState(false);

  const { updateEntity } = useBlockProtocolUpdateEntity();

  const [isConvertToPageModalOpen, setIsConvertToPageModalOpen] =
    useState(false);

  const { refetch: refetchPageTree } = useAccountPages(
    authenticatedUser.accountId as OwnedById,
  );

  const blockCollectionEntityId = quickNoteEntity.metadata.recordId.entityId;

  const { data } = useQuery<GetEntityQuery, GetEntityQueryVariables>(
    getEntityQuery,
    {
      variables: {
        includePermissions: false,
        entityId: blockCollectionEntityId,
        ...zeroedGraphResolveDepths,
        ...getBlockCollectionResolveDepth({ blockDataDepth: 1 }),
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const mostRecentContents = useMemo(
    () =>
      data?.getEntity
        ? getBlockCollectionContents({
            blockCollectionEntityId,
            blockCollectionSubgraph: data.getEntity
              .subgraph as Subgraph<EntityRootType>,
          })
        : undefined,
    [blockCollectionEntityId, data],
  );

  const contents = useMemo(
    () =>
      mostRecentContents ??
      (quickNoteSubgraph
        ? getBlockCollectionContents({
            blockCollectionEntityId,
            blockCollectionSubgraph: quickNoteSubgraph,
          })
        : undefined),
    [blockCollectionEntityId, quickNoteSubgraph, mostRecentContents],
  );

  const numberOfBlocks = useMemo(
    () => (mostRecentContents ? mostRecentContents.length : undefined),
    [mostRecentContents],
  );

  const textBlocks = useMemo(
    () =>
      mostRecentContents?.filter(({ rightEntity }) =>
        isHashTextBlock(rightEntity.componentId),
      ),
    [mostRecentContents],
  );

  const text = useMemo(
    () =>
      textBlocks?.reduce((prev, textBlock) => {
        const parsedText = parseTextFromTextBlock(textBlock);

        return `${prev}${prev.length > 0 ? " " : ""}${parsedText}`;
      }, ""),
    [textBlocks],
  );

  const numberOfWords = useMemo(
    () =>
      // Use a regex to match sequences of non-whitespace characters.
      // This will treat words like "can't" as a single word and ignore multiple spaces or other delimiters.
      text?.match(/\S+/g)?.length,
    [text],
  );

  const numberOfCharacters = useMemo(() => {
    if (!text || text === "") {
      return undefined;
    }
    const noWhitespace = text.replace(/\s+/g, ""); // Remove all whitespace characters
    const surrogatePairs =
      noWhitespace.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) ?? [];
    return noWhitespace.length - surrogatePairs.length;
  }, [text]);

  const handleArchive = useCallback(async () => {
    await updateEntity({
      data: {
        entityId: quickNoteEntity.metadata.recordId.entityId,
        entityTypeId: systemEntityTypes.quickNote.entityTypeId,
        properties: {
          ...quickNoteEntity.properties,
          "https://hash.ai/@hash/types/property-type/archived/": true,
        } as QuickNoteProperties,
      },
    });
    await refetchQuickNotes?.();
  }, [updateEntity, quickNoteEntity, refetchQuickNotes]);

  const handleRevertToQuickNote = useCallback(async () => {
    if (!convertedPage) {
      return;
    }
    setIsConvertingPage(true);

    if (convertedPage.parentLinkEntity) {
      await archiveEntity({
        variables: {
          entityId: convertedPage.parentLinkEntity.metadata.recordId.entityId,
        },
      });
    }

    await updateEntity({
      data: {
        entityId: blockCollectionEntityId,
        entityTypeId: systemEntityTypes.quickNote.entityTypeId,
        properties: {},
      },
    });

    await refetchPageTree();
    setIsConvertingPage(false);
    setConvertedPage(undefined);
  }, [
    blockCollectionEntityId,
    updateEntity,
    convertedPage,
    archiveEntity,
    refetchPageTree,
  ]);

  const handleConvertedToPage = useCallback(
    (page: PageWithParentLink) => {
      setConvertedPage(page);
      void refetchPageTree();
    },
    [refetchPageTree],
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" columnGap={2.25}>
          {displayLabel ? (
            <Typography
              sx={{
                color: ({ palette }) => palette.gray[70],
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              <NoteStickyRegularIcon
                sx={{
                  fontSize: 12,
                  marginRight: 0.75,
                  position: "relative",
                  top: 2,
                }}
              />
              Note
            </Typography>
          ) : null}
          <Fade
            in={
              typeof numberOfBlocks !== "undefined" &&
              (typeof numberOfCharacters !== "undefined" || numberOfBlocks > 1)
            }
          >
            <Box>
              <Statistic amount={numberOfBlocks} unit="block" />
            </Box>
          </Fade>
          <Fade in={typeof numberOfWords !== "undefined"}>
            <Box>
              <Statistic amount={numberOfWords} unit="word" />
            </Box>
          </Fade>
          <Fade in={typeof numberOfCharacters !== "undefined"}>
            <Box>
              <Statistic amount={numberOfCharacters} unit="character" />
            </Box>
          </Fade>
        </Box>
        {displayActionButtons ? (
          <Box display="flex" marginRight={-1} marginTop={-1} columnGap={1}>
            {convertedPage ? (
              <>
                <IconButton
                  disabled={isConvertingPage}
                  onClick={handleRevertToQuickNote}
                >
                  <UndoRegularIcon />
                </IconButton>
                {isConvertingPage ? (
                  <IconButton disabled>
                    <ArrowUpRightRegularIcon />
                  </IconButton>
                ) : (
                  <Link
                    href={constructPageRelativeUrl({
                      workspaceShortname: authenticatedUser.shortname!,
                      pageEntityUuid: extractEntityUuidFromEntityId(
                        blockCollectionEntityId,
                      ),
                    })}
                  >
                    <IconButton>
                      <ArrowUpRightRegularIcon />
                    </IconButton>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Tooltip title="Archive Note" placement="top">
                  <IconButton
                    disabled={isConvertingPage}
                    onClick={handleArchive}
                  >
                    <ArchiveRegularIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Convert to page" placement="top">
                  <IconButton
                    disabled={isConvertToPageModalOpen}
                    onClick={() => setIsConvertToPageModalOpen(true)}
                  >
                    <FileExportRegularIcon />
                  </IconButton>
                </Tooltip>
                <ConvertQuickNoteToPageModal
                  open={isConvertToPageModalOpen}
                  quickNoteEntity={quickNoteEntity}
                  onConvertedToPage={handleConvertedToPage}
                  onClose={() => setIsConvertToPageModalOpen(false)}
                />
              </>
            )}
          </Box>
        ) : null}
      </Box>
      {contents && contents.length > 0 ? (
        <BlockCollection
          autoFocus={autoFocus}
          ownedById={authenticatedUser.accountId as OwnedById}
          entityId={quickNoteEntity.metadata.recordId.entityId}
          contents={contents}
          readonly={false}
          sx={{ paddingY: 3 }}
        />
      ) : (
        <Skeleton />
      )}
    </Box>
  );
};
