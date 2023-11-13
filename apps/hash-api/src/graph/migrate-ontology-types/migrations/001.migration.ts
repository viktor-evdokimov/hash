import {
  descriptionPropertyTypeUrl,
  fileUrlPropertyTypeUrl,
  linkEntityTypeUrl,
  mimeTypePropertyTypeUrl,
} from "@local/hash-subgraph";

import { MigrationFunction } from "../types";
import {
  createSystemEntityTypeIfNotExists,
  createSystemPropertyTypeIfNotExists,
} from "../util";

const migrate: MigrationFunction = async ({
  context,
  authentication,
  migrationState,
}) => {
  /** HASH Instance entity type */

  const pagesAreEnabledPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Pages Are Enabled",
        description:
          "Whether or not user functionality related to pages is enabled.",
        possibleValues: [{ primitiveDataType: "boolean" }],
      },
      migrationState,
    },
  );

  const userSelfRegistrationIsEnabledPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "User Self Registration Is Enabled",
        description:
          "Whether or not user self registration (sign-up) is enabled.",
        possibleValues: [{ primitiveDataType: "boolean" }],
      },
      migrationState,
    });

  const orgSelfRegistrationIsEnabledPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Org Self Registration Is Enabled",
        description:
          "Whether or not a user can self-register an org (note this does not apply to instance admins).",
        possibleValues: [{ primitiveDataType: "boolean" }],
      },
      migrationState,
    });

  const userRegistrationByInviteIsEnabledPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "User Registration By Invitation Is Enabled",
        description:
          "Whether or not a user is able to register another user by inviting them to an org.",
        possibleValues: [{ primitiveDataType: "boolean" }],
      },
      migrationState,
    });

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      title: "HASH Instance",
      description: "An instance of HASH.",
      properties: [
        {
          propertyType: pagesAreEnabledPropertyType,
          required: true,
        },
        {
          propertyType: userSelfRegistrationIsEnabledPropertyType,
          required: true,
        },
        {
          propertyType: orgSelfRegistrationIsEnabledPropertyType,
          required: true,
        },
        {
          propertyType: userRegistrationByInviteIsEnabledPropertyType,
          required: true,
        },
      ],
      outgoingLinks: [],
    },
    migrationState,
  });

  /** File entity type */

  const fileStorageBucketPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "File Storage Bucket",
        description: "The bucket in which a file is stored.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const fileStorageEndpointPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "File Storage Endpoint",
        description:
          "The endpoint for making requests to a file storage provider.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const fileStorageForcePathStylePropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "File Storage Force Path Style",
        description:
          "Whether to force path style for requests to a file storage provider (vs virtual host style).",
        possibleValues: [{ primitiveDataType: "boolean" }],
      },
      migrationState,
    });

  const fileStorageKeyPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "File Storage Key",
        description: "The key identifying a file in storage.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const fileStorageProviderPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "File Storage Provider",
        description: "The provider of a file storage service.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const fileStorageRegionPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "File Storage Region",
        description: "The region in which a file is stored.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const fileEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "File",
        description: "A file hosted at a URL",
        properties: [
          {
            propertyType: fileUrlPropertyTypeUrl,
            required: true,
          },
          {
            propertyType: descriptionPropertyTypeUrl,
          },
          {
            propertyType: mimeTypePropertyTypeUrl,
          },
          {
            propertyType: fileStorageBucketPropertyType,
          },
          {
            propertyType: fileStorageEndpointPropertyType,
          },
          {
            propertyType: fileStorageForcePathStylePropertyType,
          },
          {
            propertyType: fileStorageKeyPropertyType,
          },
          {
            propertyType: fileStorageProviderPropertyType,
          },
          {
            propertyType: fileStorageRegionPropertyType,
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/file-name/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/display-name/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/original-url/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/original-source/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/file-size/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/file-hash/v/1",
          },
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/original-file-name/v/1",
          },
        ],
      },
      migrationState,
    },
  );

  /** Image File entity type */

  const imageFileEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [fileEntityType.schema.$id],
        title: "Image",
        description: "An image file hosted at a URL",
      },
      migrationState,
    },
  );

  /** Block entity type */

  const componentIdPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Component Id",
        description: "An identifier for a component.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const hasDataLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Data",
        description: "The data that something has.",
      },
      migrationState,
    },
  );

  const blockEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Block",
        description:
          "A block that displays or otherwise uses data, part of a wider page or collection.",
        properties: [
          {
            propertyType: componentIdPropertyType,
            required: true,
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: hasDataLinkEntityType,
            minItems: 1,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Block Collection entity type */

  const blockCollectionEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Block Collection",
        description: "A collection of blocks.",
      },
      migrationState,
    },
  );

  /** Profile Bio entity type */

  const fractionalIndexPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Fractional Index",
        description:
          "The fractional index indicating the current position of something.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const hasIndexedContentLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Indexed Content",
        description: "Something contained at an index by something",
        properties: [
          {
            propertyType: fractionalIndexPropertyType,
            required: true,
          },
        ],
      },
      migrationState,
    });

  const profileBioEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [blockCollectionEntityType.schema.$id],
        title: "Profile Bio",
        description:
          "A biography for display on someone or something's profile.",
        outgoingLinks: [
          {
            linkEntityType: hasIndexedContentLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Organization entity type */

  const shortnamePropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Shortname",
        description: "A unique identifier for something, in the form of a slug",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const orgNamePropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Organization Name",
        description: "The name of an organization.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const locationPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Location",
        description: "A location for something, expressed as a single string",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const websiteUrlPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Website URL",
        description: "A URL for a website",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const pinnedEntityTypeBaseUrlPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Pinned Entity Type Base URL",
        description: "The base URL of a pinned entity type.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const hasAvatarLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Avatar",
        description: "The avatar something has.",
      },
      migrationState,
    },
  );

  const hasCoverImageLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Cover Image",
        description: "The cover image something has.",
      },
      migrationState,
    },
  );

  const hasBioLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Bio",
        description: "The biography something has.",
      },
      migrationState,
    },
  );

  const orgEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Organization",
        description:
          "An organization. Organizations are root-level objects that contain user accounts and teams.",
        properties: [
          {
            propertyType: shortnamePropertyType,
            required: true,
          },
          {
            propertyType: orgNamePropertyType,
            required: true,
          },
          {
            propertyType: descriptionPropertyTypeUrl,
            required: false,
          },
          {
            propertyType: locationPropertyType,
            required: false,
          },
          {
            propertyType: websiteUrlPropertyType,
            required: false,
          },
          {
            propertyType: pinnedEntityTypeBaseUrlPropertyType,
            array: { maxItems: 5 },
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: hasAvatarLinkEntityType,
            destinationEntityTypes: [imageFileEntityType],
            maxItems: 1,
            minItems: 0,
          },
          {
            linkEntityType: hasCoverImageLinkEntityType,
            destinationEntityTypes: [imageFileEntityType],
            maxItems: 1,
            minItems: 0,
          },
          {
            linkEntityType: hasBioLinkEntityType,
            destinationEntityTypes: [profileBioEntityType],
            minItems: 0,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Service Account entity type */

  const profileUrlPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Profile URL",
        description: "A URL to a profile",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const serviceAccountEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Service Account",
        description: "A service account.",
        properties: [
          {
            propertyType: profileUrlPropertyType,
            /**
             * @todo: we may want to make this optional in the future, when
             * we allow child types to set inherited properties to required
             */
            required: true,
          },
        ],
      },
      migrationState,
    },
  );

  /** Linked In Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "LinkedIn Account",
      description: "A LinkedIn account.",
    },
    migrationState,
  });

  /** Twitter Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "Twitter Account",
      description: "A Twitter account.",
    },
    migrationState,
  });

  /** TikTok Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "TikTok Account",
      description: "A TikTok account.",
    },
    migrationState,
  });

  /** Facebook Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "Facebook Account",
      description: "A Facebook account.",
    },
    migrationState,
  });

  /** Instagram Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "Instagram Account",
      description: "An Instagram account.",
    },
    migrationState,
  });

  /** GitHub Account entity type */

  await createSystemEntityTypeIfNotExists(context, authentication, {
    entityTypeDefinition: {
      allOf: [serviceAccountEntityType.schema.$id],
      title: "GitHub Account",
      description: "A GitHub account.",
    },
    migrationState,
  });

  /** User entity type */

  const emailPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Email",
        description: "An email address",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const kratosIdentityIdPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Kratos Identity Id",
        description: "An identifier for a record in Ory Kratos.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const preferredNamePropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Preferred Name",
        description: "The preferred name of someone or something.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const preferredPronounsPropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Preferred Pronouns",
        description: "Someone's preferred pronouns.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const isMemberOfLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Is Member Of",
        description: "Something that someone or something is a member of.",
      },
      migrationState,
    },
  );

  const hasServiceAccountLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Service Account",
        description: "The service account something has.",
      },
      migrationState,
    });

  const userEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "User",
        description: "A user of the HASH application.",
        properties: [
          {
            propertyType: shortnamePropertyType,
          },
          {
            propertyType: emailPropertyType,
            required: true,
            array: { minItems: 1 },
          },
          {
            propertyType: kratosIdentityIdPropertyType,
            required: true,
          },
          {
            propertyType: preferredNamePropertyType,
          },
          {
            propertyType: preferredPronounsPropertyType,
          },
          {
            propertyType: locationPropertyType,
          },
          {
            propertyType: websiteUrlPropertyType,
          },
          {
            propertyType: pinnedEntityTypeBaseUrlPropertyType,
            array: { maxItems: 5 },
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: isMemberOfLinkEntityType,
            destinationEntityTypes: [orgEntityType],
          },
          {
            linkEntityType: hasAvatarLinkEntityType,
            destinationEntityTypes: [imageFileEntityType],
            maxItems: 1,
            minItems: 0,
          },
          {
            linkEntityType: hasServiceAccountLinkEntityType,
            destinationEntityTypes: [serviceAccountEntityType],
          },
          {
            linkEntityType: hasBioLinkEntityType,
            destinationEntityTypes: [profileBioEntityType],
            minItems: 0,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Text entity type */

  const textEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Text",
        description: "An ordered sequence of characters.",
        properties: [
          {
            propertyType:
              "https://blockprotocol.org/@blockprotocol/types/property-type/textual-content/v/2",
            required: true,
          },
        ],
      },
      migrationState,
    },
  );

  /** Page entity type */

  const archivedPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        possibleValues: [{ primitiveDataType: "boolean" }],
        title: "Archived",
        description: "Whether or not something has been archived.",
      },
      migrationState,
    },
  );

  const summaryPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Summary",
        description: "The summary of the something.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const titlePropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Title",
        description: "The title of something.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const iconPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Icon",
        description: "An emoji icon.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const hasParentLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Parent",
        description: "The parent something has.",
      },
      migrationState,
    },
  );

  const pageEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [blockCollectionEntityType.schema.$id],
        title: "Page",
        description:
          "A page for displaying and potentially interacting with data.",
        properties: [
          {
            propertyType: summaryPropertyType,
          },
          {
            propertyType: archivedPropertyType,
          },
          {
            propertyType: iconPropertyType,
          },
          {
            propertyType: titlePropertyType,
            required: true,
          },
          {
            propertyType: fractionalIndexPropertyType,
            required: true,
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: hasParentLinkEntityType,
            destinationEntityTypes: ["SELF_REFERENCE"],
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Document entity type */

  const _documentEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Document",
        description:
          "A page in document format, with content arranged in columns.",
        allOf: [pageEntityType.schema.$id],
        outgoingLinks: [
          {
            linkEntityType: hasIndexedContentLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 0,
          },
        ],
      },
      migrationState,
    },
  );

  /** Canvas entity type */

  const xPositionPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "X Position",
        description: "The position of something on the x axis.",
        possibleValues: [{ primitiveDataType: "number" }],
      },
      migrationState,
    },
  );

  const yPositionPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Y Position",
        description: "The position of something on the y axis.",
        possibleValues: [{ primitiveDataType: "number" }],
      },
      migrationState,
    },
  );

  const heightInPixelsPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Height In Pixels",
        description: "The height of something in pixels.",
        possibleValues: [{ primitiveDataType: "number" }],
      },
      migrationState,
    },
  );

  const widthInPixelsPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Width In Pixels",
        description: "The width of something in pixels.",
        possibleValues: [{ primitiveDataType: "number" }],
      },
      migrationState,
    },
  );

  const rotationInRadsPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Rotation In Rads",
        description: "The rotation of something in radians.",
        possibleValues: [{ primitiveDataType: "number" }],
      },
      migrationState,
    },
  );

  const hasSpatiallyPositionedContentLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Spatially Positioned Content",
        description: "Something contained at a spatial position by something",
        properties: [
          {
            propertyType: xPositionPropertyType,
            required: true,
          },
          {
            propertyType: yPositionPropertyType,
            required: true,
          },
          {
            propertyType: heightInPixelsPropertyType,
            required: true,
          },
          {
            propertyType: widthInPixelsPropertyType,
            required: true,
          },
          {
            propertyType: rotationInRadsPropertyType,
            required: true,
          },
        ],
      },
      migrationState,
    });

  const _canvasEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Canvas",
        description:
          "A page in canvas format, with content in a free-form arrangement.",
        allOf: [pageEntityType.schema.$id],
        outgoingLinks: [
          {
            linkEntityType: hasSpatiallyPositionedContentLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 0,
          },
        ],
      },
      migrationState,
    },
  );

  /** Quick Note entity */

  const _quickNoteEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [blockCollectionEntityType.schema.$id],
        title: "Quick Note",
        description: "A (usually) quick or short note.",
        properties: [{ propertyType: archivedPropertyType }],
        outgoingLinks: [
          {
            linkEntityType: hasIndexedContentLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  const expiredAtPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Expired At",
        description: "Stringified timestamp of when something expired.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const connectionSourceNamePropertyType =
    await createSystemPropertyTypeIfNotExists(context, authentication, {
      propertyTypeDefinition: {
        title: "Connection Source Name",
        description: "The name of the connection source.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    });

  const vaultPathPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Vault Path",
        description: "The path to a secret in Hashicorp Vault.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const linearTeamIdPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Linear Team Id",
        description: "The unique identifier for a team in Linear.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const syncLinearDataWithLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Sync Linear Data With",
        description: "Something that syncs linear data with something.",
        properties: [
          {
            propertyType: linearTeamIdPropertyType,
            array: true,
          },
        ],
      },
      migrationState,
    });

  const usesUserSecretLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Uses User Secret",
        description: "The user secret something uses.",
      },
      migrationState,
    },
  );

  const userSecretEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "User Secret",
        description: "A secret or credential belonging to a user.",
        properties: [
          {
            propertyType: expiredAtPropertyType,
            required: true,
          },
          {
            propertyType: connectionSourceNamePropertyType,
            required: true,
          },
          {
            propertyType: vaultPathPropertyType,
            required: true,
          },
        ],
      },
      migrationState,
    },
  );

  const linearOrgIdPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Linear Org Id",
        description: "The unique identifier for an org in Linear.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const _linearIntegrationEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Linear Integration",
        description: "An instance of an integration with Linear.",
        properties: [
          {
            propertyType: linearOrgIdPropertyType,
            required: true,
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: syncLinearDataWithLinkEntityType,
            destinationEntityTypes: [userEntityType, orgEntityType],
          },
          {
            linkEntityType: usesUserSecretLinkEntityType,
            destinationEntityTypes: [userSecretEntityType],
            minItems: 1,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Comment entity type */

  const resolvedAtPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Resolved At",
        description: "Stringified timestamp of when something was resolved.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const deletedAtPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Deleted At",
        description: "Stringified timestamp of when something was deleted.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const hasTextLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Has Text",
        description: "The text something has.",
      },
      migrationState,
    },
  );

  const authoredByLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Authored By",
        description: "What or whom something was authored by.",
      },
      migrationState,
    },
  );

  const commentEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Comment",
        description: "Comment associated with the issue.",
        properties: [
          {
            propertyType: resolvedAtPropertyType,
          },
          {
            propertyType: deletedAtPropertyType,
          },
        ],
        outgoingLinks: [
          {
            linkEntityType: hasTextLinkEntityType,
            destinationEntityTypes: [textEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: hasParentLinkEntityType,
            destinationEntityTypes: ["SELF_REFERENCE", blockEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: authoredByLinkEntityType,
            destinationEntityTypes: [userEntityType],
            minItems: 1,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    },
  );

  /** Notification entity type */

  const readAtPropertyType = await createSystemPropertyTypeIfNotExists(
    context,
    authentication,
    {
      propertyTypeDefinition: {
        title: "Read At",
        description: "The timestamp of when something was read.",
        possibleValues: [{ primitiveDataType: "text" }],
      },
      migrationState,
    },
  );

  const notificationEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        title: "Notification",
        description: "A notification to a user.",
        properties: [
          {
            propertyType: archivedPropertyType,
          },
          {
            propertyType: readAtPropertyType,
          },
        ],
      },
      migrationState,
    },
  );

  /** Mention Notification entity type */

  const occurredInEntityLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Occurred In Entity",
        description: "An entity that something occurred in.",
      },
      migrationState,
    });

  const occurredInBlockLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Occurred In Block",
        description: "A block that something occurred in.",
      },
      migrationState,
    },
  );

  const occurredInCommentLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Occurred In Comment",
        description: "A comment that something occurred in.",
      },
      migrationState,
    });

  const occurredInTextLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Occurred In Text",
        description: "Text that something occurred in.",
      },
      migrationState,
    },
  );

  const triggeredByUserLinkEntityType = await createSystemEntityTypeIfNotExists(
    context,
    authentication,
    {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Triggered By User",
        description: "A user that triggered something.",
      },
      migrationState,
    },
  );

  const _mentionNotificationEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [notificationEntityType.schema.$id],
        title: "Mention Notification",
        description: "A notification that a user was mentioned somewhere.",

        outgoingLinks: [
          {
            linkEntityType: occurredInEntityLinkEntityType,
            destinationEntityTypes: [pageEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: occurredInBlockLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: occurredInCommentLinkEntityType,
            destinationEntityTypes: [commentEntityType],
            minItems: 0,
            maxItems: 1,
          },
          {
            linkEntityType: occurredInTextLinkEntityType,
            destinationEntityTypes: [textEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: triggeredByUserLinkEntityType,
            destinationEntityTypes: [userEntityType],
            minItems: 1,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    });

  /** Comment Notification entity type */

  const triggeredByCommentLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Triggered By Comment",
        description: "A comment that triggered something.",
      },
      migrationState,
    });

  const repliedToCommentLinkEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        allOf: [linkEntityTypeUrl],
        title: "Replied To Comment",
        description: "The comment that something replied to.",
      },
      migrationState,
    });

  const _commentNotificationEntityType =
    await createSystemEntityTypeIfNotExists(context, authentication, {
      entityTypeDefinition: {
        title: "Comment Notification",
        description: "A notification related to a comment.",
        allOf: [notificationEntityType.schema.$id],
        outgoingLinks: [
          {
            linkEntityType: occurredInEntityLinkEntityType,
            destinationEntityTypes: [pageEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: occurredInBlockLinkEntityType,
            destinationEntityTypes: [blockEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: triggeredByCommentLinkEntityType,
            destinationEntityTypes: [commentEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: triggeredByUserLinkEntityType,
            destinationEntityTypes: [userEntityType],
            minItems: 1,
            maxItems: 1,
          },
          {
            linkEntityType: repliedToCommentLinkEntityType,
            destinationEntityTypes: [commentEntityType],
            minItems: 0,
            maxItems: 1,
          },
        ],
      },
      migrationState,
    });

  return migrationState;
};

export default migrate;
