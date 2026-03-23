import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { DehydrateFieldSets } from '@/types/transformers/fieldClassification'

function isReferenceField(frontendKey: string, fieldMetadata: FieldMetadataEntry | undefined): boolean {
  return (
    fieldMetadata?.dataType === 'reference' ||
    frontendKey.endsWith('Ref') ||
    frontendKey.endsWith('Id') ||
    frontendKey === 'id'
  )
}

function transformUndefinedValueForDehydrate(
  frontendKey: string,
  fieldSets: DehydrateFieldSets,
  fieldMetadata: FieldMetadataEntry | undefined
): [string, unknown] | null {
  if (!fieldSets.requiredFields.has(frontendKey)) return null
  if (!fieldMetadata) return null
  if (fieldMetadata.dataType === 'reference') return null
  if (fieldMetadata.dataType === 'boolean') return [frontendKey, false]
  if (fieldMetadata.dataType === 'number') return [frontendKey, 0]
  if (fieldMetadata.dataType === 'string') return [frontendKey, '']
  return null
}

function transformNullValueForDehydrate(
  frontendKey: string,
  value: null,
  fieldSets: DehydrateFieldSets,
  fieldMetadata: FieldMetadataEntry | undefined
): [string, unknown] | null {
  if (!isReferenceField(frontendKey, fieldMetadata)) return [frontendKey, value]
  return fieldSets.requiredFields.has(frontendKey) ? [frontendKey, null] : null
}

function transformEmptyStringForDehydrate(
  frontendKey: string,
  value: string,
  fieldSets: DehydrateFieldSets,
  fieldMetadata: FieldMetadataEntry | undefined
): [string, unknown] | null {
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

export function transformFieldForDehydrate(
  [frontendKey, value]: [string, unknown],
  fieldSets: DehydrateFieldSets,
  metadata: Record<string, FieldMetadataEntry>
): [string, unknown] | null {
  if (frontendKey === FIELD_NAMES.ENTITY_KEY) return null

  const fieldMetadata = metadata[frontendKey]

  if (value === undefined) {
    return transformUndefinedValueForDehydrate(frontendKey, fieldSets, fieldMetadata)
  }
  if (value === null) {
    return transformNullValueForDehydrate(frontendKey, null, fieldSets, fieldMetadata)
  }
  if (value === '') {
    return transformEmptyStringForDehydrate(frontendKey, '', fieldSets, fieldMetadata)
  }

  return [frontendKey, value]
}
