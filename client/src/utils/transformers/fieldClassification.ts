
import { ENTITY_SCHEMA_DEFAULTS } from '@/constants/entitySchemaDefaults'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { safeArray } from './transformerPrimitives'
import type { DehydrateFieldSets } from '@/types/transformers/fieldClassification'

export type { DehydrateFieldSets } from '@/types/transformers/fieldClassification'

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
