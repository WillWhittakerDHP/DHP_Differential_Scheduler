/**
 * LEARNING: Utility for extracting and filtering field keys from entities
 * WHY: Eliminates duplication between DynamicForm and EntityFormContent
 * PATTERN: Pure function that extracts field keys with system field filtering
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * System fields that should be excluded from field rendering
 * LEARNING: These fields are managed by the system or handled separately
 * WHY: Prevents "Unknown input type" warnings and ensures proper field handling
 * PATTERN: Centralized list of system fields to filter
 */
const SYSTEM_FIELDS = ['id', 'entityKey', 'orderIndex', 'createdAt', 'updatedAt', 'annotations'] as const

/**
 * Options for getting field keys
 */
export interface GetFieldKeysOptions<GE extends GlobalEntityKey> {
  /**
   * Entity object to extract keys from
   */
  entity: Record<string, unknown> | null | undefined
  /**
   * Field metadata (optional, if provided will be used as source of truth)
   */
  fieldMetadata?: Record<string, FieldMetadataEntry> | null
  /**
   * Entity key for type safety
   */
  entityKey: GE
}

/**
 * Get field keys from entity, filtering system fields and preferring metadata
 * LEARNING: Extracts keys from entity immediately, uses metadata if available
 * WHY: Entity keys are always available, metadata provides additional filtering
 * PATTERN: Prefer metadata keys if available, otherwise use filtered entity keys
 * 
 * @param options - Options containing entity, fieldMetadata, and entityKey
 * @returns Array of field keys ready for rendering
 */
export function getFieldKeys<GE extends GlobalEntityKey>(
  options: GetFieldKeysOptions<GE>
): GlobalFieldKey<GE>[] {
  const { entity, fieldMetadata } = options

  // LEARNING: Get keys from entity object immediately - they're always available
  // WHY: Entity object has all field keys as properties, no need to wait for metadata
  // PATTERN: Extract keys from entity, filter out non-field properties and system fields
  const entityKeys = entity ? Object.keys(entity).filter(key => {
    // Filter out non-field properties that shouldn't be rendered
    // LEARNING: Exclude system fields (createdAt, updatedAt) and special fields (annotations)
    // WHY: System fields are managed by database, annotations handled via RelationshipCollection
    // PATTERN: Filter out known system/special fields to prevent "Unknown input type" warnings
    return !SYSTEM_FIELDS.includes(key as typeof SYSTEM_FIELDS[number])
  }) as GlobalFieldKey<GE>[] : []

  // LEARNING: If metadata is available, use it as source of truth for which fields to include
  // WHY: Metadata might have additional fields or filter out some fields
  // PATTERN: Prefer metadata keys if available, otherwise use entity keys
  if (fieldMetadata && Object.keys(fieldMetadata).length > 0) {
    const metadataKeys = Object.keys(fieldMetadata) as GlobalFieldKey<GE>[]
    return metadataKeys
  }

  // LEARNING: Fallback to entity keys if metadata not yet loaded
  // WHY: Don't wait for metadata - field keys are available immediately from entity
  // PATTERN: Use entity keys immediately, metadata will update when it loads
  return entityKeys
}
