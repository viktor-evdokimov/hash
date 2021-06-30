import { ApolloError } from "apollo-server-express";

import { DbPage } from "../../../types/dbTypes";
import {
  MutationInsertBlockIntoPageArgs,
  Resolver,
} from "../../autoGeneratedTypes";
import { GraphQLContext } from "../../context";

export const insertBlockIntoPage: Resolver<
  Promise<DbPage>,
  {},
  GraphQLContext,
  MutationInsertBlockIntoPageArgs
> = async (
  _,
  {
    componentId,
    entityId,
    entityProperties,
    entityType,
    namespaceId,
    pageId,
    position,
  },
  { dataSources }
) => {
  // TODO: everything here should be inside a transaction

  const page = await dataSources.db.getEntity({namespaceId, id: pageId});
  if (!page) {
    throw new ApolloError(`Could not find page with pageId ${pageId}`, "NOT_FOUND");
  }

  let entity;
  if (entityId) {
    // Update
    entity = await dataSources.db.getEntity({namespaceId, id: entityId});
    if (!entity) {
      throw new ApolloError(`entity ${entityId} not found`, "NOT_FOUND");
    }
  } else if (entityProperties && entityType) {
    // Create new entity
    entity = await dataSources.db.createEntity({
      namespaceId,
      createdById: "", // TODO
      type: entityType,
      properties: entityProperties
    });
  } else {
    throw new Error(
      `One of entityId OR entityProperties and entityType must be provided`
    );
  }

  const blockProperties = {
    componentId,
    entityType: entity.type,
    entityId: entity.id,
  };

  const newBlock = dataSources.db.createEntity({
    namespaceId,
    type: entity.type,
    createdById: "", // TODO
    properties: blockProperties
  });

  if (position > page.properties.contents.length) {
    position = page.properties.contents.length;
  }

  page.properties.contents = [
    ...page.properties.contents.slice(0, position),
    newBlock,
    ...page.properties.contents.slice(position),
  ];
  const updatedPage = await dataSources.db.updateEntity({ ...page });

  return updatedPage as DbPage;
};
