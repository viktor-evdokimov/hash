import { JSONObject } from "@hashintel/block-protocol";
import { merge } from "lodash";
import { Account, Entity, EntityType, UnresolvedGQLEntityType } from ".";
import { DBClient } from "../db";
import {
  DBLinkedEntity,
  EntityMeta,
  EntityType as DbEntityType,
} from "../db/adapter";
import {
  Visibility,
  Entity as GQLEntity,
  UnknownEntity as GQLUnknownEntity,
  EntityVersion,
} from "../graphql/apiTypes.gen";
import { SystemType } from "../types/entityTypes";

export type EntityExternalResolvers =
  | "entityType" // resolved in resolvers/entityTypeTypeFields
  | "linkGroups" // resolved in resolvers/linkGroups
  | "linkedEntities" // resolved in resolvers/linkedEntities
  | "linkedAggregations" // resovled in resolvers/linkedAggregations
  | "__typename";

export type UnresolvedGQLEntity = Omit<GQLEntity, EntityExternalResolvers> & {
  entityType: UnresolvedGQLEntityType;
};

export type UnresolvedGQLUnknownEntity = Omit<
  GQLUnknownEntity,
  EntityExternalResolvers
> & { entityType: UnresolvedGQLEntityType };

export type EntityConstructorArgs = {
  entityId: string;
  entityVersionId: string;
  createdById: string;
  accountId: string;
  entityType: DbEntityType | EntityType;
  properties: JSONObject;
  visibility: Visibility;
  metadata: EntityMeta;
  entityCreatedAt: Date;
  entityVersionCreatedAt: Date;
  entityVersionUpdatedAt: Date;
};

type CreateEntityArgsWithoutType = {
  accountId: string;
  createdById: string;
  versioned: boolean;
  properties: any;
  entityVersionId?: string;
  entityId?: string;
};

export type CreateEntityWithEntityTypeIdArgs = {
  entityTypeId: string;
} & CreateEntityArgsWithoutType;

export type CreateEntityWithEntityTypeVersionIdArgs = {
  entityTypeVersionId: string;
} & CreateEntityArgsWithoutType;

export type CreateEntityWithSystemTypeArgs = {
  systemTypeName: SystemType;
} & CreateEntityArgsWithoutType;

export type CreateEntityArgs =
  | CreateEntityWithEntityTypeIdArgs
  | CreateEntityWithEntityTypeVersionIdArgs
  | CreateEntityWithSystemTypeArgs;

class __Entity {
  entityId: string;
  entityVersionId: string;
  createdById: string;
  accountId: string;
  entityType: EntityType;
  properties: JSONObject;
  visibility: Visibility;
  metadata: EntityMeta;
  entityCreatedAt: Date;
  entityVersionCreatedAt: Date;
  entityVersionUpdatedAt: Date;

  constructor({
    entityId,
    entityVersionId,
    createdById,
    accountId,
    entityType,
    properties,
    visibility,
    metadata,
    entityCreatedAt,
    entityVersionCreatedAt,
    entityVersionUpdatedAt,
  }: EntityConstructorArgs) {
    this.entityId = entityId;
    this.entityVersionId = entityVersionId;
    this.createdById = createdById;
    this.accountId = accountId;
    this.entityType =
      entityType instanceof EntityType
        ? entityType
        : new EntityType(entityType);
    this.properties = properties;
    this.visibility = visibility;
    this.metadata = metadata;
    this.entityCreatedAt = entityCreatedAt;
    this.entityVersionCreatedAt = entityVersionCreatedAt;
    this.entityVersionUpdatedAt = entityVersionUpdatedAt;
  }

  static async create(
    client: DBClient,
    params: CreateEntityArgs,
  ): Promise<Entity> {
    const dbEntity = await client.createEntity(params);

    return new Entity(dbEntity);
  }

  static async getEntity(
    client: DBClient,
    params: {
      accountId: string;
      entityVersionId: string;
    },
  ): Promise<Entity | null> {
    const dbEntity = await client.getEntity(params);

    return dbEntity ? new Entity(dbEntity) : null;
  }

  /** Gets all versions of a single entity */
  static async getEntityHistory(
    client: DBClient,
    {
      accountId,
      entityId,
      order,
    }: {
      accountId: string;
      entityId: string;
      order: "asc" | "desc";
    },
  ): Promise<EntityVersion[]> {
    const entities = await client.getEntityHistory({
      accountId,
      entityId,
      order,
    });
    return entities.map((entity) => ({
      ...entity,
      createdAt: entity.createdAt.toISOString(),
    }));
  }

  static async getEntityLatestVersion(
    client: DBClient,
    params: {
      accountId: string;
      entityId: string;
    },
  ): Promise<Entity | null> {
    const dbEntity = await client.getEntityLatestVersion(params);

    return dbEntity ? new Entity(dbEntity) : null;
  }

  static async getEntitiesByType(
    client: DBClient,
    params: {
      accountId: string;
      entityTypeId: string;
      entityTypeVersionId?: string;
      latestOnly: boolean;
    },
  ): Promise<Entity[]> {
    const dbEntities = await client.getEntitiesByType(params);

    return dbEntities.map((dbEntity) => new Entity(dbEntity));
  }

  static async getEntitiesBySystemType(
    client: DBClient,
    params: {
      accountId: string;
      latestOnly: boolean;
      systemTypeName: SystemType;
    },
  ): Promise<Entity[]> {
    const dbEntities = await client.getEntitiesBySystemType(params);

    return dbEntities.map((dbEntity) => new Entity(dbEntity));
  }

  static async getEntities(
    client: DBClient,
    entities: {
      accountId: string;
      entityId: string;
      entityVersionId?: string;
    }[],
  ): Promise<Entity[]> {
    const dbEntities = await client.getEntities(entities);

    return dbEntities.map((dbEntity) => new Entity(dbEntity));
  }

  static async updateProperties(
    client: DBClient,
    params: { accountId: string; entityId: string; properties: string },
  ) {
    const updatedDbEntity = await client.updateEntity(params);

    return new Entity(updatedDbEntity);
  }

  convertToDBLink(): DBLinkedEntity {
    return {
      __linkedData: {
        entityId: this.entityId,
        entityTypeId: this.entityType.entityId,
      },
    };
  }

  protected async updateProperties(client: DBClient, properties: any) {
    const updatedDbEntity = await client.updateEntity({
      accountId: this.accountId,
      entityId: this.entityId,
      properties,
    });
    merge(this, new Entity(updatedDbEntity));

    return this.properties;
  }

  updateEntityProperties(client: DBClient, properties: JSONObject) {
    return this.updateProperties(client, properties);
  }

  async transferEntity(client: DBClient, newAccountId: string) {
    if (Account.isEntityAnAccount(this)) {
      throw new Error(
        `Trying to transfer entity ${this.entityId} which is an account. Accounts can't be transferred.`,
      );
    }
    const exists = await Account.accountExists(client, newAccountId);
    if (!exists) {
      throw new Error(
        `Trying to transfer entity to new account ${newAccountId} which doesn't exist.`,
      );
    }
    await client.updateEntityAccountId({
      originalAccountId: this.accountId,
      entityId: this.entityId,
      newAccountId,
    });
    this.accountId = newAccountId;
  }

  static acquireLock(client: DBClient, params: { entityId: string }) {
    return client.acquireEntityLock(params);
  }

  acquireLock(client: DBClient) {
    return Entity.acquireLock(client, { entityId: this.entityId });
  }

  /**
   * Refetches the entity's latest version, updating the entity's properties
   * and related values to the latest version found in the datastore.
   *
   * This may update the `entityVersionId` if the entity is versioned.
   */
  async refetchLatestVersion(client: DBClient) {
    const refetchedDbEntity = await client.getEntityLatestVersion({
      accountId: this.accountId,
      entityId: this.entityId,
    });

    if (!refetchedDbEntity) {
      throw new Error(
        `Could not find latest version of entity with entityId ${this.entityId} in the datastore`,
      );
    }

    merge(this, new Entity(refetchedDbEntity));

    return this;
  }

  toGQLEntity(): Omit<UnresolvedGQLEntity, "properties"> {
    return {
      id: this.entityVersionId,
      entityId: this.entityId,
      entityVersionId: this.entityVersionId,
      createdById: this.createdById,
      accountId: this.accountId,
      entityTypeId: this.entityType.entityId,
      entityTypeVersionId: this.entityType.entityVersionId,
      /** @todo: stop casting this */
      entityTypeName: this.entityType.properties.title as string,
      entityType: this.entityType.toGQLEntityType(),
      metadataId: this.entityId,
      createdAt: this.entityCreatedAt.toISOString(),
      entityVersionCreatedAt: this.entityVersionCreatedAt.toISOString(),
      updatedAt: this.entityVersionUpdatedAt.toISOString(),
      visibility: this.visibility,
    };
  }

  toGQLUnknownEntity(): UnresolvedGQLUnknownEntity {
    return {
      ...this.toGQLEntity(),
      properties: this.properties,
    };
  }
}

export default __Entity;
