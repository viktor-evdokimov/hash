import { useQuery } from "@apollo/client";
import { VersionedUrl } from "@blockprotocol/type-system";
import { Filter } from "@local/hash-graph-client";
import { TextProperties } from "@local/hash-isomorphic-utils/entity";
import { generateEntityLabel } from "@local/hash-isomorphic-utils/generate-entity-label";
import {
  currentTimeInstantTemporalAxes,
  mapGqlSubgraphFieldsFragmentToSubgraph,
  zeroedGraphResolveDepths,
} from "@local/hash-isomorphic-utils/graph-queries";
import {
  systemEntityTypes,
  systemLinkEntityTypes,
} from "@local/hash-isomorphic-utils/ontology-type-ids";
import {
  SimpleProperties,
  simplifyProperties,
} from "@local/hash-isomorphic-utils/simplify-properties";
import {
  BlockProperties,
  CommentNotificationProperties,
  CommentProperties,
  NotificationProperties,
  OccurredInEntityProperties,
  PageProperties,
} from "@local/hash-isomorphic-utils/system-types/commentnotification";
import { GraphChangeNotificationProperties } from "@local/hash-isomorphic-utils/system-types/graphchangenotification";
import { MentionNotificationProperties } from "@local/hash-isomorphic-utils/system-types/mentionnotification";
import { UserProperties } from "@local/hash-isomorphic-utils/system-types/user";
import {
  Entity,
  EntityRootType,
  extractEntityUuidFromEntityId,
  LinkEntityAndRightEntity,
} from "@local/hash-subgraph";
import { getOutgoingLinkAndTargetEntities } from "@local/hash-subgraph/stdlib";
import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from "react";

import {
  StructuralQueryEntitiesQuery,
  StructuralQueryEntitiesQueryVariables,
} from "../../graphql/api-types.gen";
import { structuralQueryEntitiesQuery } from "../../graphql/queries/knowledge/entity.queries";
import { constructMinimalUser, MinimalUser } from "../../lib/user-and-org";
import { useNotificationEntities } from "../../shared/notification-entities-context";

export type PageMentionNotification = {
  kind: "page-mention";
  entity: Entity<MentionNotificationProperties>;
  occurredInEntity: Entity<PageProperties>;
  occurredInBlock: Entity<BlockProperties>;
  occurredInText: Entity<TextProperties>;
  triggeredByUser: MinimalUser;
} & SimpleProperties<MentionNotificationProperties>;

export type CommentMentionNotification = {
  kind: "comment-mention";
  occurredInComment: Entity<CommentProperties>;
} & Omit<PageMentionNotification, "kind">;

export type NewCommentNotification = {
  kind: "new-comment";
  entity: Entity<CommentNotificationProperties>;
  occurredInEntity: Entity<PageProperties>;
  occurredInBlock: Entity<BlockProperties>;
  triggeredByComment: Entity<CommentProperties>;
  triggeredByUser: MinimalUser;
} & SimpleProperties<CommentNotificationProperties>;

export type CommentReplyNotification = {
  kind: "comment-reply";
  repliedToComment: Entity<CommentProperties>;
} & Omit<NewCommentNotification, "kind">;

export type PageRelatedNotification =
  | PageMentionNotification
  | CommentMentionNotification
  | NewCommentNotification
  | CommentReplyNotification;

export type GraphChangeNotification = {
  entity: Entity<GraphChangeNotificationProperties>;
  kind: "graph-change";
  occurredInEntityEditionTimestamp: string | undefined;
  occurredInEntityLabel: string;
  occurredInEntity: Entity;
  operation: string;
} & SimpleProperties<NotificationProperties>;

export type Notification = PageRelatedNotification | GraphChangeNotification;

type NotificationsWithLinksContextValue = {
  notifications?: Notification[];
};

export const NotificationsWithLinksContext =
  createContext<null | NotificationsWithLinksContextValue>(null);

export const useNotificationsWithLinks = () => {
  const notificationsWithLinksContext = useContext(
    NotificationsWithLinksContext,
  );

  if (!notificationsWithLinksContext) {
    throw new Error("Context missing");
  }

  return notificationsWithLinksContext;
};

const isLinkAndRightEntityWithLinkType =
  (linkEntityTypeId: VersionedUrl) =>
  ({ linkEntity }: LinkEntityAndRightEntity) =>
    linkEntity[0] && linkEntity[0].metadata.entityTypeId === linkEntityTypeId;

export const useNotificationsWithLinksContextValue =
  (): NotificationsWithLinksContextValue => {
    const { notificationEntities } = useNotificationEntities();

    const getNotificationEntitiesFilter = useMemo<Filter>(
      () => ({
        any:
          notificationEntities?.map((draftEntity) => ({
            equal: [
              { path: ["uuid"] },
              {
                parameter: extractEntityUuidFromEntityId(
                  draftEntity.metadata.recordId.entityId,
                ),
              },
            ],
          })) ?? [],
      }),
      [notificationEntities],
    );

    const { data: notificationsWithOutgoingLinksData } = useQuery<
      StructuralQueryEntitiesQuery,
      StructuralQueryEntitiesQueryVariables
    >(structuralQueryEntitiesQuery, {
      variables: {
        includePermissions: false,
        query: {
          filter: getNotificationEntitiesFilter,
          graphResolveDepths: {
            ...zeroedGraphResolveDepths,
            inheritsFrom: { outgoing: 255 },
            isOfType: { outgoing: 1 },
            // Retrieve the outgoing linked entities of the notification entity at depth 1
            hasLeftEntity: { outgoing: 0, incoming: 1 },
            hasRightEntity: { outgoing: 1, incoming: 0 },
          },
          temporalAxes: currentTimeInstantTemporalAxes,
          includeDrafts: true,
        },
      },
      skip: !notificationEntities || notificationEntities.length === 0,
      fetchPolicy: "network-only",
    });

    const outgoingLinksSubgraph = useMemo(
      () =>
        notificationsWithOutgoingLinksData
          ? mapGqlSubgraphFieldsFragmentToSubgraph<EntityRootType>(
              notificationsWithOutgoingLinksData.structuralQueryEntities
                .subgraph,
            )
          : undefined,
      [notificationsWithOutgoingLinksData],
    );

    const previouslyFetchedNotificationsRef = useRef<Notification[] | null>(
      null,
    );

    const notifications = useMemo<Notification[] | undefined>(() => {
      if (notificationEntities && notificationEntities.length === 0) {
        return [];
      } else if (!outgoingLinksSubgraph || !notificationEntities) {
        return previouslyFetchedNotificationsRef.current ?? undefined;
      }

      const derivedNotifications = notificationEntities
        .map((entity) => {
          const {
            metadata: {
              entityTypeId,
              recordId: { entityId },
            },
          } = entity;

          const { readAt } = simplifyProperties(entity.properties);

          const outgoingLinks = getOutgoingLinkAndTargetEntities(
            outgoingLinksSubgraph,
            entityId,
          );

          if (
            entityTypeId === systemEntityTypes.mentionNotification.entityTypeId
          ) {
            const occurredInEntity = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInEntity.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const occurredInBlock = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInBlock.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const occurredInText = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInText.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const triggeredByUserEntity = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.triggeredByUser.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            if (
              !occurredInEntity ||
              !occurredInBlock ||
              !occurredInText ||
              !triggeredByUserEntity
            ) {
              throw new Error(
                `Mention notification "${entityId}" is missing required links`,
              );
            }

            const triggeredByUser = constructMinimalUser({
              userEntity: triggeredByUserEntity as Entity<UserProperties>,
            });

            const occurredInComment = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInComment.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            if (occurredInComment) {
              return {
                kind: "comment-mention",
                readAt,
                entity,
                occurredInEntity: occurredInEntity as Entity<PageProperties>,
                occurredInBlock: occurredInBlock as Entity<BlockProperties>,
                occurredInText: occurredInText as Entity<TextProperties>,
                triggeredByUser,
                occurredInComment:
                  occurredInComment as Entity<CommentProperties>,
              } satisfies CommentMentionNotification;
            }

            return {
              kind: "page-mention",
              readAt,
              entity,
              occurredInEntity: occurredInEntity as Entity<PageProperties>,
              occurredInBlock: occurredInBlock as Entity<BlockProperties>,
              occurredInText: occurredInText as Entity<TextProperties>,
              triggeredByUser,
            } satisfies PageMentionNotification;
          } else if (
            entityTypeId === systemEntityTypes.commentNotification.entityTypeId
          ) {
            const occurredInEntity = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInEntity.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const occurredInBlock = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInBlock.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const triggeredByComment = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.triggeredByComment.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            const triggeredByUserEntity = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.triggeredByUser.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            if (
              !occurredInEntity ||
              !occurredInBlock ||
              !triggeredByComment ||
              !triggeredByUserEntity
            ) {
              throw new Error(
                `Comment notification "${entityId}" is missing required links`,
              );
            }

            const triggeredByUser = constructMinimalUser({
              userEntity: triggeredByUserEntity as Entity<UserProperties>,
            });

            const repliedToComment = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.repliedToComment.linkEntityTypeId,
              ),
            )?.rightEntity[0];

            if (repliedToComment) {
              return {
                kind: "comment-reply",
                readAt,
                entity,
                occurredInEntity: occurredInEntity as Entity<PageProperties>,
                occurredInBlock: occurredInBlock as Entity<BlockProperties>,
                triggeredByComment,
                repliedToComment,
                triggeredByUser,
              } satisfies CommentReplyNotification;
            }

            return {
              kind: "new-comment",
              readAt,
              entity,
              occurredInEntity: occurredInEntity as Entity<PageProperties>,
              occurredInBlock: occurredInBlock as Entity<BlockProperties>,
              triggeredByComment,
              triggeredByUser,
            } satisfies NewCommentNotification;
          } else if (
            entityTypeId ===
            systemEntityTypes.graphChangeNotification.entityTypeId
          ) {
            const occurredInEntityLink = outgoingLinks.find(
              isLinkAndRightEntityWithLinkType(
                systemLinkEntityTypes.occurredInEntity.linkEntityTypeId,
              ),
            );

            if (!occurredInEntityLink) {
              throw new Error(
                `Graph change notification "${entityId}" is missing required links`,
              );
            }

            const occurredInEntityEditionTimestamp = (
              occurredInEntityLink
                .linkEntity[0] as Entity<OccurredInEntityProperties>
            ).properties[
              "https://hash.ai/@hash/types/property-type/entity-edition-id/"
            ];

            if (!occurredInEntityEditionTimestamp) {
              throw new Error(
                `Graph change notification "${entityId}" Occurred In Entity link is missing required entityEditionId property`,
              );
            }

            const occurredInEntity = occurredInEntityLink.rightEntity[0];
            if (!occurredInEntity) {
              // @todo archive the notification when the entity it occurred in is archived
              return null;
            }

            const graphChangeEntity =
              entity as Entity<GraphChangeNotificationProperties>;

            return {
              kind: "graph-change",
              readAt,
              entity: graphChangeEntity,
              occurredInEntityLabel: generateEntityLabel(
                outgoingLinksSubgraph,
                occurredInEntity,
              ),
              occurredInEntityEditionTimestamp,
              occurredInEntity,
              operation:
                graphChangeEntity.properties[
                  "https://hash.ai/@hash/types/property-type/graph-change-type/"
                ],
            } satisfies GraphChangeNotification;
          }
          throw new Error(`Notification of type "${entityTypeId}" not handled`);
        })
        .filter(
          (notification): notification is NonNullable<typeof notification> =>
            !!notification,
        )

        .sort((a, b) => {
          if (a.readAt && !b.readAt) {
            return 1;
          } else if (b.readAt && !a.readAt) {
            return -1;
          }

          const aCreatedAt = new Date(
            a.entity.metadata.provenance.createdAtDecisionTime,
          );
          const bCreatedAt = new Date(
            b.entity.metadata.provenance.createdAtDecisionTime,
          );

          const timeDifference = bCreatedAt.getTime() - aCreatedAt.getTime();
          if (timeDifference !== 0) {
            return timeDifference;
          }
          return a.entity.metadata.recordId.entityId >
            b.entity.metadata.recordId.entityId
            ? 1
            : -1;
        });

      previouslyFetchedNotificationsRef.current = derivedNotifications;

      return derivedNotifications;
    }, [notificationEntities, outgoingLinksSubgraph]);

    return { notifications };
  };

export const NotificationsWithLinksContextProvider: FunctionComponent<
  PropsWithChildren
> = ({ children }) => {
  const value = useNotificationsWithLinksContextValue();

  return (
    <NotificationsWithLinksContext.Provider value={value}>
      {children}
    </NotificationsWithLinksContext.Provider>
  );
};
