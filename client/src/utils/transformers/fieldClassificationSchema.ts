import { ENTITY_SCHEMA_DEFAULTS } from '@/constants/entitySchemaDefaults'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { safeArray } from '@/utils/transformers/transformerPrimitives'
import type { DehydrateFieldSets } from '@/types/transformers/fieldClassification'

function extractMetadataRequiredFieldKeys(metadata: Record<string, FieldMetadataEntry>): string[] {
  return Object.entries(metadata)
    .filter(([, fieldMetadata]) => fieldMetadata.isRequired)
    .map(([fieldKey]) => fieldKey)
}

function splitMetadataBooleanFields(
  metadata: Record<string, FieldMetadataEntry>,
  schemaNonNullableBooleansSet: Set<string>,
  schemaNullableBooleansSet: Set<string>
): { nonNullable: string[]; nullable: string[] } {
  return Object.entries(metadata)
    .filter(
      ([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'boolean' &&
        !schemaNonNullableBooleansSet.has(fieldKey) &&
        !schemaNullableBooleansSet.has(fieldKey)
    )
    .reduce(
      (acc, [fieldKey, fieldMetadata]) => {
        if (fieldMetadata.isRequired) {
          return { ...acc, nonNullable: [...acc.nonNullable, fieldKey] }
        }
        return { ...acc, nullable: [...acc.nullable, fieldKey] }
      },
      { nonNullable: [] as string[], nullable: [] as string[] }
    )
}

function extractMetadataRequiredNumberKeys(
  metadata: Record<string, FieldMetadataEntry>,
  schemaRequiredNumbersSet: Set<string>
): string[] {
  return Object.entries(metadata)
    .filter(
      ([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'number' &&
        fieldMetadata.isRequired &&
        !schemaRequiredNumbersSet.has(fieldKey)
    )
    .map(([fieldKey]) => fieldKey)
}

export function buildFieldClassificationSets(
  entityType: string,
  metadata: Record<string, FieldMetadataEntry>
): DehydrateFieldSets {
  const rawRequired = (ENTITY_SCHEMA_DEFAULTS.REQUIRED_BOOLEANS as Record<string, unknown>)[entityType]
  const rawNullable = (ENTITY_SCHEMA_DEFAULTS.NULLABLE_BOOLEANS as Record<string, unknown>)[entityType]
  const rawNumbers = (ENTITY_SCHEMA_DEFAULTS.REQUIRED_NUMBERS as Record<string, unknown>)[entityType]
  const schemaRequiredBooleans = safeArray<string>(Array.isArray(rawRequired) ? (rawRequired as string[]) : [])
  const schemaNullableBooleans = safeArray<string>(Array.isArray(rawNullable) ? (rawNullable as string[]) : [])
  const schemaRequiredNumbers = safeArray<string>(Array.isArray(rawNumbers) ? (rawNumbers as string[]) : [])

  const schemaNonNullableBooleansSet = new Set(schemaRequiredBooleans)
  const schemaNullableBooleansSet = new Set(schemaNullableBooleans)
  const schemaRequiredNumbersSet = new Set(schemaRequiredNumbers)

  const metadataRequiredFields = extractMetadataRequiredFieldKeys(metadata)
  const metadataBooleanFields = splitMetadataBooleanFields(
    metadata,
    schemaNonNullableBooleansSet,
    schemaNullableBooleansSet
  )
  const metadataRequiredNumbers = extractMetadataRequiredNumberKeys(metadata, schemaRequiredNumbersSet)

  return {
    requiredFields: new Set([
      ...schemaRequiredBooleans,
      ...schemaRequiredNumbers,
      ...metadataRequiredFields,
    ]),
    nullableBooleanFields: new Set([...schemaNullableBooleans, ...metadataBooleanFields.nullable]),
    nonNullableBooleanFields: new Set([...schemaRequiredBooleans, ...metadataBooleanFields.nonNullable]),
    requiredNumberFields: new Set([...schemaRequiredNumbers, ...metadataRequiredNumbers]),
  }
}
