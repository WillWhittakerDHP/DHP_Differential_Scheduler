/**
 * LEARNING: Utility for extracting and filtering field keys from entities
 * WHY: Eliminates duplication between DynamicForm and EntityFormContent
 * PATTERN: Pure function that extracts field keys with system field filtering
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'

/**
 * System fields that should be excluded from field rendering
 * LEARNING: These fields are managed by the system or handled separately
 * WHY: Prevents "Unknown input type" warnings and ensures proper field handling
 * PATTERN: Centralized list of system fields to filter (uses entityFieldConstants)
 */
const SYSTEM_FIELDS = [
  FIELD_NAMES.ID,
  FIELD_NAMES.ENTITY_KEY,
  FIELD_NAMES.ORDER_INDEX,
  FIELD_NAMES.CREATED_AT,
  FIELD_NAMES.UPDATED_AT,
  FIELD_NAMES.ANNOTATIONS,
] as const

export interface GetFieldKeysOptions<GE extends GlobalEntityKey> {
  entity: Record<string, unknown> | null | undefined
  fieldMetadata?: Record<string, FieldMetadataEntry> | null
  entityKey: GE
}

export function getFieldKeys<GE extends GlobalEntityKey>(
  options: GetFieldKeysOptions<GE>
): GlobalFieldKey<GE>[] {
  const { entity, fieldMetadata } = options

  // WHY: Entity object has all field keys as properties, no need to wait for metadata
  // PATTERN: Extract keys from entity, filter out non-field properties and system fields
  const entityKeys = entity ? Object.keys(entity).filter(key => {
    // PATTERN: Filter out known system/special fields to prevent "Unknown input type" warnings
    return !SYSTEM_FIELDS.includes(key as typeof SYSTEM_FIELDS[number])
  }) as GlobalFieldKey<GE>[] : []

  // LEARNING: If metadata is available, use it as source of truth for which fields to include
  // PATTERN: Prefer metadata keys if available, otherwise use entity keys
  if (fieldMetadata && Object.keys(fieldMetadata).length > 0) {
    const metadataKeys = Object.keys(fieldMetadata) as GlobalFieldKey<GE>[]
    return metadataKeys
  }

  // PATTERN: Use entity keys immediately, metadata will update when it loads
  return entityKeys
}
