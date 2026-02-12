/**
 * Field Classification for Dehydrate
 *
 * LEARNING: Determines which fields are used vs unused and their default values for API payloads.
 * WHY: Centralizes metadata + schema logic so dehydrateEntity stays simple.
 * PATTERN: Schema defaults override metadata; flat guard clauses for default selection.
 */

import { ENTITY_SCHEMA_DEFAULTS } from '@/constants/entitySchemaDefaults'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { safeArray } from './transformerPrimitives'

export type DehydrateFieldSets = {
  requiredFields: Set<string>
  nullableBooleanFields: Set<string>
  nonNullableBooleanFields: Set<string>
  requiredNumberFields: Set<string>
}

function isReferenceField(
  frontendKey: string,
  fieldMetadata: FieldMetadataEntry | undefined
): boolean {
  return (
    fieldMetadata?.dataType === 'reference' ||
    frontendKey.endsWith('Ref') ||
    frontendKey.endsWith('Id') ||
    frontendKey === 'id'
  )
}

/**
 * Build field classification sets for dehydrateEntity from entity type and metadata.
 * PATTERN: Schema defaults override metadata; used to coerce empty strings and defaults.
 */
export function buildFieldClassificationSets(
  entityType: string,
  metadata: Record<string, FieldMetadataEntry>
): DehydrateFieldSets {
  const schemaRequiredBooleans = safeArray(
    ENTITY_SCHEMA_DEFAULTS.REQUIRED_BOOLEANS[entityType as keyof typeof ENTITY_SCHEMA_DEFAULTS.REQUIRED_BOOLEANS]
  )
  const schemaNullableBooleans = safeArray(
    ENTITY_SCHEMA_DEFAULTS.NULLABLE_BOOLEANS[entityType as keyof typeof ENTITY_SCHEMA_DEFAULTS.NULLABLE_BOOLEANS]
  )
  const schemaRequiredNumbers = safeArray(
    ENTITY_SCHEMA_DEFAULTS.REQUIRED_NUMBERS[entityType as keyof typeof ENTITY_SCHEMA_DEFAULTS.REQUIRED_NUMBERS]
  )

  const schemaNonNullableBooleansSet = new Set(schemaRequiredBooleans)
  const schemaNullableBooleansSet = new Set(schemaNullableBooleans)
  const schemaRequiredNumbersSet = new Set(schemaRequiredNumbers)

  const metadataRequiredFields = Object.entries(metadata)
    .filter(([, fieldMetadata]) => fieldMetadata.isRequired)
    .map(([fieldKey]) => fieldKey)

  const metadataBooleanFields = Object.entries(metadata)
    .filter(
      ([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'boolean' &&
        !(schemaNonNullableBooleansSet as Set<string>).has(fieldKey) &&
        !(schemaNullableBooleansSet as Set<string>).has(fieldKey)
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

  const metadataRequiredNumbers = Object.entries(metadata)
    .filter(
      ([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'number' &&
        fieldMetadata.isRequired &&
        !(schemaRequiredNumbersSet as Set<string>).has(fieldKey)
    )
    .map(([fieldKey]) => fieldKey)

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

/**
 * Transform a single field entry for dehydrate (frontend → API).
 * PATTERN: Flat guard clauses; returns [key, value] or null to filter.
 */
export function transformFieldForDehydrate(
  [frontendKey, value]: [string, unknown],
  fieldSets: DehydrateFieldSets,
  metadata: Record<string, FieldMetadataEntry>
): [string, unknown] | null {
  if (frontendKey === FIELD_NAMES.ENTITY_KEY) return null

  const fieldMetadata = metadata[frontendKey]

  if (value === undefined) {
    if (!fieldSets.requiredFields.has(frontendKey)) return null
    if (!fieldMetadata) return null
    if (fieldMetadata.dataType === 'reference') return null
    if (fieldMetadata.dataType === 'boolean') return [frontendKey, false]
    if (fieldMetadata.dataType === 'number') return [frontendKey, 0]
    if (fieldMetadata.dataType === 'string') return [frontendKey, '']
    return null
  }

  if (value === null) {
    if (!isReferenceField(frontendKey, fieldMetadata)) return [frontendKey, value]
    return fieldSets.requiredFields.has(frontendKey) ? [frontendKey, null] : null
  }

  if (value === '') {
    if (
      fieldSets.nullableBooleanFields.has(frontendKey) ||
      fieldSets.nonNullableBooleanFields.has(frontendKey)
    ) {
      const convertedValue = fieldSets.nullableBooleanFields.has(frontendKey) ? null : false
      return [frontendKey, convertedValue]
    }
    if (fieldSets.requiredNumberFields.has(frontendKey)) return [frontendKey, 0]
    if (isReferenceField(frontendKey, fieldMetadata)) return [frontendKey, null]
    return [frontendKey, value]
  }

  return [frontendKey, value]
}
