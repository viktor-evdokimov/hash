import { EntityType } from "@blockprotocol/type-system";
import { systemEntityTypes } from "@local/hash-isomorphic-utils/ontology-type-ids";
import { BaseUrl } from "@local/hash-subgraph";
import { extractBaseUrl } from "@local/hash-subgraph/type-system-patch";

import { getEntityTypeById } from "../../../ontology/primitive/entity-type";
import { MigrationFunction } from "../types";
import {
  createSystemPropertyTypeIfNotExists,
  getCurrentHashSystemEntityTypeId,
  updateSystemEntityType,
  upgradeDependenciesInHashEntityType,
  upgradeEntitiesToNewTypeVersion,
} from "../util";

const migrate: MigrationFunction = async ({
  context,
  authentication,
  migrationState,
}) => {
  /**
   * Step 1. Create the `enabledFeatureFlag` property type
   */

  const enabledFeatureFlagPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Enabled Feature Flag",
        description: "An identifier for a feature flag that is enabled.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      webShortname: "hash",
      migrationState,
    });

  /**
   * Step 2: Add the `enabledFeatureFlag` property type to the `User` entity type
   */

  const currentUserEntityTypeId = getCurrentHashSystemEntityTypeId({
    entityTypeKey: "user",
    migrationState,
  });

  const { schema: userEntityTypeSchema } = await getEntityTypeById(
    context,
    authentication,
    {
      entityTypeId: currentUserEntityTypeId,
    },
  );

  const newUserEntityTypeSchema: EntityType = {
    ...userEntityTypeSchema,
    properties: {
      ...userEntityTypeSchema.properties,
      [extractBaseUrl(enabledFeatureFlagPropertyType.schema.$id)]: {
        type: "array",
        items: {
          $ref: enabledFeatureFlagPropertyType.schema.$id,
        },
      },
    },
  };

  const { updatedEntityTypeId: updatedUserEntityTypeId } =
    await updateSystemEntityType(context, authentication, {
      currentEntityTypeId: currentUserEntityTypeId,
      migrationState,
      newSchema: newUserEntityTypeSchema,
    });

  /**
   * Step 4: Update the dependencies of the `User` entity type
   * */
  await upgradeDependenciesInHashEntityType(context, authentication, {
    upgradedEntityTypeIds: [updatedUserEntityTypeId],
    dependentEntityTypeKeys: [
      // These can all link to a User
      "comment",
      "commentNotification",
      "linearIntegration",
      "mentionNotification",
    ],
    migrationState,
  });

  /**
   * Step 5: Assign entities of updated types to the latest version
   */
  const baseUrls = [
    systemEntityTypes.user.entityTypeBaseUrl,
    systemEntityTypes.comment.entityTypeBaseUrl,
    systemEntityTypes.commentNotification.entityTypeBaseUrl,
    systemEntityTypes.linearIntegration.entityTypeBaseUrl,
    systemEntityTypes.mentionNotification.entityTypeBaseUrl,
  ] as BaseUrl[];

  await upgradeEntitiesToNewTypeVersion(context, authentication, {
    entityTypeBaseUrls: baseUrls,
    migrationState,
  });

  return migrationState;
};

export default migrate;
