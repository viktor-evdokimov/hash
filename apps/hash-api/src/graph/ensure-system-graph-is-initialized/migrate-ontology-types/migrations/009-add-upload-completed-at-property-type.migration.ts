import { EntityType } from "@blockprotocol/type-system";
import {
  systemDataTypes,
  systemEntityTypes,
} from "@local/hash-isomorphic-utils/ontology-type-ids";
import { BaseUrl } from "@local/hash-subgraph";
import {
  extractBaseUrl,
  versionedUrlFromComponents,
} from "@local/hash-subgraph/type-system-patch";

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
  /** Step 1: Create the upload completed at */
  const dateTimeDataTypeBaseUrl = systemDataTypes.datetime
    .dataTypeBaseUrl as BaseUrl;

  const dateTimeDataTypeVersion =
    migrationState.dataTypeVersions[dateTimeDataTypeBaseUrl];

  if (typeof dateTimeDataTypeVersion === "undefined") {
    throw new Error(
      `Expected data type version for ${dateTimeDataTypeBaseUrl} to be defined`,
    );
  }

  const dateTimeDataTypeId = versionedUrlFromComponents(
    dateTimeDataTypeBaseUrl,
    dateTimeDataTypeVersion,
  );

  const uploadCompletedAtPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Upload Completed At",
        description: "The timestamp when the upload of something has completed",
        possibleValues: [{ dataTypeId: dateTimeDataTypeId }],
      },
      webShortname: "hash",
      migrationState,
    });

  /** Step 2: Add the property to the file entity type */

  const currentFileEntityTypeId = getCurrentHashSystemEntityTypeId({
    entityTypeKey: "file",
    migrationState,
  });

  const { schema: fileEntityTypeSchema } = await getEntityTypeById(
    context,
    authentication,
    {
      entityTypeId: currentFileEntityTypeId,
    },
  );

  const newFileEntityTypeSchema: EntityType = {
    ...fileEntityTypeSchema,
    properties: {
      ...fileEntityTypeSchema.properties,
      [extractBaseUrl(uploadCompletedAtPropertyType.schema.$id)]: {
        $ref: uploadCompletedAtPropertyType.schema.$id,
      },
    },
  };

  const { updatedEntityTypeId: updatedFileEntityTypeId } =
    await updateSystemEntityType(context, authentication, {
      currentEntityTypeId: currentFileEntityTypeId,
      migrationState,
      newSchema: newFileEntityTypeSchema,
    });

  /** Step 3: Update the dependencies of entity types which we've updated above */
  await upgradeDependenciesInHashEntityType(context, authentication, {
    upgradedEntityTypeIds: [updatedFileEntityTypeId],
    dependentEntityTypeKeys: [
      // `Image` inherits from the `File` entity type
      "image",
    ],
    migrationState,
  });

  /** Step 4: Assign entities of updated types to the latest version */
  const baseUrls = [
    systemEntityTypes.file.entityTypeBaseUrl,
    systemEntityTypes.image.entityTypeBaseUrl,
  ] as BaseUrl[];

  await upgradeEntitiesToNewTypeVersion(context, authentication, {
    entityTypeBaseUrls: baseUrls,
    migrationState,
  });

  return migrationState;
};

export default migrate;
