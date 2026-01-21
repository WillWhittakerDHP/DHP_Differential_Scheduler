/**
 * LEARNING: Entity Type Mapping Utility
 * WHY: Provides generic entity type handling without special casing
 * PATTERN: Single source of truth for mapping entityKey to metadata entityType
 * 
 * This utility eliminates the need for if (entityKey === 'blockShape') checks
 * by providing generic mapping functions that work for all entity types.
 */

import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

/**
 * Entity metadata type - used for admin_primitive_metadata table
 */
export type EntityMetadataType = 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance'

/**
 * Sentinel UUIDs for global shape entity configurations
 */
export const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
export const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
export const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003'
export const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'

/**
 * Get entity type for metadata lookup
 * Maps entityKey to the corresponding metadata entityType
 * 
 * @param entityKey - The entity key (blockShape, partShape, blockInstance, partInstance, etc.)
 * @returns EntityMetadataType for metadata lookup, or null if not supported
 */
export function getEntityTypeForMetadata(entityKey: GlobalEntityKey): EntityMetadataType | null {
  // Map entityKey directly - no transformation needed
  // blockShape → blockShape, partShape → partShape
  // blockInstance → blockInstance, partInstance → partInstance
  if (entityKey === 'blockShape' || entityKey === 'partShape' || 
      entityKey === 'blockInstance' || entityKey === 'partInstance') {
    return entityKey as EntityMetadataType
  }
  
  return null
}

/**
 * Get entity ID for metadata lookup
 * Returns the entity ID to use when fetching metadata
 * 
 * @param entityKey - The entity key
 * @param entity - The entity object
 * @returns Entity ID (actual ID or sentinel UUID for global configs), or null if not supported
 */
export function getMetadataEntityId<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE>
): string | null {
  const entityType = getEntityTypeForMetadata(entityKey)
  if (!entityType) {
    return null
  }

  // For shape entities, use sentinel UUIDs for global configurations
  if (entityType === 'blockShape') {
    return BLOCK_SHAPE_GLOBAL_CONFIG_ID
  }
  
  if (entityType === 'partShape') {
    return PART_SHAPE_GLOBAL_CONFIG_ID
  }

  // For instance entities, check if using global config ID or template/placeholder UUID
  const entityId = String(entity.id)
  
  // Check for placeholder/template UUID (all zeros or known placeholder pattern)
  const PLACEHOLDER_UUID = '00000000-0000-0000-0000-000000000000'
  const isPlaceholder = entityId === PLACEHOLDER_UUID
  
  // LEARNING: Check for temporary IDs used when creating new entities
  // WHY: New entities get IDs like "new-1234567890" which should use global config metadata
  // PATTERN: Treat IDs starting with "new-" as placeholders
  const isTemporaryId = entityId.startsWith('new-')
  
  if (entityType === 'partInstance') {
    if (entityId === PART_INSTANCE_GLOBAL_CONFIG_ID) {
      return PART_INSTANCE_GLOBAL_CONFIG_ID
    }
    // For template/temporary partInstance, use global partInstance config
    if (isPlaceholder || isTemporaryId) {
      return PART_INSTANCE_GLOBAL_CONFIG_ID
    }
    // LEARNING: For existing partInstance entities, use the actual entity ID
    // WHY: Backend supports instance-specific metadata - it checks for metadata at this ID and falls back to global config if none exists
    // PATTERN: Return actual entity ID - backend will handle fallback to global config if no instance-specific metadata exists
    return entityId
  }
  
  if (entityType === 'blockInstance') {
    // For template/temporary blockInstance, use global blockInstance config sentinel UUID
    // BlockInstance has its own fields (doesn't inherit from blockShape)
    if (isPlaceholder || isTemporaryId) {
      return BLOCK_INSTANCE_GLOBAL_CONFIG_ID
    }
    // LEARNING: For existing blockInstance entities, use the actual entity ID
    // WHY: Backend supports instance-specific metadata - it checks for metadata at this ID and falls back to global config if none exists
    // PATTERN: Return actual entity ID - backend will handle fallback to global config if no instance-specific metadata exists
    return entityId
  }

  // Fallback (shouldn't reach here for instance entities)
  return entityId
}
