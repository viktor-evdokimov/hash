import {
  Array,
  Object as BpObject,
  OneOf,
  PropertyTypeReference,
  PropertyValues,
  ValueOrArray,
} from "@blockprotocol/type-system";

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export const isPropertyValueArray = (
  propertyValue: PropertyValues,
): propertyValue is Array<OneOf<PropertyValues>> => {
  return "type" in propertyValue && propertyValue.type === "array";
};

export const isPropertyValuePropertyObject = (
  propertyValue: PropertyValues,
): propertyValue is BpObject<ValueOrArray<PropertyTypeReference>> => {
  return "type" in propertyValue && propertyValue.type === "object";
};
