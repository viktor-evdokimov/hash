import { ApolloError } from "apollo-server-express";

import { DbUnknownEntity } from "../../../types/dbTypes";
import { MutationUpdateEntityArgs, Resolver } from "../../autoGeneratedTypes";
import { entities } from "../../../mockData/entities";
import { isCompositeType } from "graphql";

export const updateEntity: Resolver<
  Promise<DbUnknownEntity>,
  {},
  {},
  MutationUpdateEntityArgs
> = async (_, { id, properties }) => {
  const entity = entities.find((entity) => entity.id === id) as DbUnknownEntity;

  if (!entity) {
    throw new ApolloError(`Could not find entity with id ${id}`, "NOT_FOUND");
  }

  // Temporary hack - need to figure out how clients side property updates properly. How do they update things on the root entity, e.g. type?
  const propertiesToUpdate = properties.properties ?? properties;

  // Temporary hack to make sure property updates don't overwrite linkedData
  // with the resolved entity
  for (const key of Object.keys(propertiesToUpdate)) {
    if (entity.properties[key as keyof DbUnknownEntity]?.__linkedData) {
      delete propertiesToUpdate[key];
    }
  }

  entity.properties = propertiesToUpdate;

  return entity;
};
