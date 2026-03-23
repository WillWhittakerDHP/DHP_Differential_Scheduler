/**
 * WHY: Pure metadata → admin default values (entityDefaults audit / FUNCTION playbook).
 */

import type { ValidAdminValue } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { EntityMetadataType } from '@/constants/entities'
import type { AppLogger } from '@/utils/logger'

/** Instance-like metadata entity types where `active` defaults to true (not shapes). */
export const INSTANCE_TYPES_DEFAULT_ACTIVE_TRUE: ReadonlySet<EntityMetadataType> = new Set([
  'blockInstance',
  'partInstance',
  'eventInstance',
  'annotationInstance',
])

export type MetadataFieldMerge =
  | { action: 'skip' }
  | { action: 'set'; value: ValidAdminValue }

export function resolveMetadataFieldMerge(
  fieldKey: string,
  fieldMeta: FieldMetadataEntry,
  entityType: EntityMetadataType
): MetadataFieldMerge {
  const { dataType, isRequired } = fieldMeta

  if (dataType === 'ternary') {
    return { action: 'set', value: 'false' }
  }

  if (dataType === 'boolean') {
    if (fieldKey === 'active' && INSTANCE_TYPES_DEFAULT_ACTIVE_TRUE.has(entityType)) {
      return { action: 'set', value: true }
    }
    return { action: 'set', value: isRequired ? false : undefined }
  }

  if (dataType === 'number') {
    if (isRequired) {
      return { action: 'set', value: 0 }
    }
    return { action: 'skip' }
  }

  if (dataType === 'string') {
    return { action: 'set', value: '' }
  }

  if (dataType === 'array') {
    return { action: 'set', value: [] }
  }

  return { action: 'skip' }
}

export function accumulateDefaultsFromMetadataEntries(
  metadata: Record<string, FieldMetadataEntry>,
  entityType: EntityMetadataType,
  logger: AppLogger
): Record<string, ValidAdminValue> {
  const baseDefaults: Record<string, ValidAdminValue> = { orderIndex: 0 }
  try {
    return Object.entries(metadata).reduce((acc, [fieldKey, fieldMetadata]) => {
      if (fieldKey in acc) {
        return acc
      }
      const merged = resolveMetadataFieldMerge(fieldKey, fieldMetadata, entityType)
      if (merged.action === 'skip') {
        return acc
      }
      return { ...acc, [fieldKey]: merged.value }
    }, baseDefaults)
  } catch (error) {
    logger.error('Error iterating metadata:', error)
    return baseDefaults
  }
}
