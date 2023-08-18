import { BaseUrl, EntityType, PropertyType } from "@blockprotocol/type-system";
import { EntityRootType, Subgraph } from "@local/hash-subgraph";
import {
  getEntityTypeAndParentsById,
  getPropertyTypeById,
  getRoots,
} from "@local/hash-subgraph/stdlib";
import { extractBaseUrl } from "@local/hash-subgraph/type-system-patch";
import { useEffect, useMemo, useState } from "react";

import { useBlockProtocolQueryEntities } from "../../../../../components/hooks/block-protocol-functions/knowledge/use-block-protocol-query-entities";
import { EntityTypeEntitiesContextValue } from "./shared/entity-type-entities-context";

export const useEntityTypeEntitiesContextValue = (
  typeBaseUrl: BaseUrl | null,
): EntityTypeEntitiesContextValue => {
  const [loading, setLoading] = useState(false);
  const [subgraph, setSubgraph] = useState<Subgraph<EntityRootType>>();
  const { queryEntities } = useBlockProtocolQueryEntities();

  useEffect(() => {
    if (!typeBaseUrl) {
      return;
    }

    setLoading(true);

    void queryEntities({
      data: {
        operation: {
          multiFilter: {
            filters: [
              {
                field: ["metadata", "entityTypeBaseUrl"],
                operator: "EQUALS",
                value: typeBaseUrl,
              },
            ],
            operator: "AND",
          },
        },
        graphResolveDepths: {
          constrainsPropertiesOn: { outgoing: 255 },
          inheritsFrom: { outgoing: 255 },
          isOfType: { outgoing: 1 },
        },
      },
    })
      .then((res) => {
        if (res.data) {
          setSubgraph(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [queryEntities, typeBaseUrl]);

  const [entities, entityTypes, propertyTypes] =
    useMemo(() => {
      if (!subgraph) {
        return undefined;
      }

      const relevantEntities = getRoots(subgraph).filter(
        ({ metadata: { entityTypeId } }) =>
          extractBaseUrl(entityTypeId) === typeBaseUrl,
      );

      const relevantTypesMap = new Map<string, EntityType>();
      for (const {
        metadata: { entityTypeId },
      } of relevantEntities) {
        if (!relevantTypesMap.has(entityTypeId)) {
          const types = getEntityTypeAndParentsById(subgraph, entityTypeId);
          for (const { schema } of types) {
            relevantTypesMap.set(schema.$id, schema);
          }
        }
      }

      const relevantTypes = Array.from(relevantTypesMap.values());

      const relevantPropertiesMap = new Map<string, PropertyType>();
      for (const { properties } of relevantTypes) {
        for (const prop of Object.values(properties)) {
          const propertyUrl = "items" in prop ? prop.items.$ref : prop.$ref;
          if (!relevantPropertiesMap.has(propertyUrl)) {
            const propertyType = getPropertyTypeById(
              subgraph,
              propertyUrl,
            )?.schema;
            if (propertyType) {
              relevantPropertiesMap.set(propertyUrl, propertyType);
            }
          }
        }
      }
      const relevantProperties = Array.from(relevantPropertiesMap.values());

      return [relevantEntities, relevantTypes, relevantProperties];
    }, [subgraph, typeBaseUrl]) ?? [];

  return {
    entities,
    entityTypes,
    loading,
    propertyTypes,
    subgraph,
  };
};
