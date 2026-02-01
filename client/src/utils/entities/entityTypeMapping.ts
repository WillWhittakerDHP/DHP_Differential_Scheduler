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

export type EntityMetadataType = 'blockShape' | 'partShape' | 'blockInstance' | 'partInstance' | 'eventShape' | 'eventInstance' | 'annotationShape' | 'annotationInstance'

export const BLOCK_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000001'
export const PART_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000002'
export const PART_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000003'
export const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000004'
export const EVENT_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000010'
export const EVENT_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000012'
export const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000011'
export const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = '00000000-0000-0000-0000-000000000013'

export function getEntityTypeForMetadata(entityKey: GlobalEntityKey): EntityMetadataType | null {
  if (entityKey === 'blockShape' || entityKey === 'partShape' || 
      entityKey === 'blockInstance' || entityKey === 'partInstance' ||
      entityKey === 'eventShape' || entityKey === 'eventInstance' ||
      entityKey === 'annotationShape' || entityKey === 'annotationInstance') {
    return entityKey as EntityMetadataType
  }
  
  return null
}

export function getMetadataEntityId<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: GlobalEntity<GE>
): string | null {
  const entityType = getEntityTypeForMetadata(entityKey)
  if (!entityType) {
    return null
  }

  if (entityType === 'blockShape') {
    return BLOCK_SHAPE_GLOBAL_CONFIG_ID
  }
  
  if (entityType === 'partShape') {
    return PART_SHAPE_GLOBAL_CONFIG_ID
  }

  if (entityType === 'eventShape') {
    return EVENT_SHAPE_GLOBAL_CONFIG_ID
  }

  if (entityType === 'annotationShape') {
    return ANNOTATION_SHAPE_GLOBAL_CONFIG_ID
  }

  const entityId = String(entity.id)
  
  const PLACEHOLDER_UUID = '00000000-0000-0000-0000-000000000000'
  const isPlaceholder = entityId === PLACEHOLDER_UUID
  
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
    // PATTERN: Return actual entity ID - backend will handle fallback to global config if no instance-specific metadata exists
    return entityId
  }
  
  if (entityType === 'blockInstance') {
    // For template/temporary blockInstance, use global blockInstance config sentinel UUID
    if (isPlaceholder || isTemporaryId) {
      return BLOCK_INSTANCE_GLOBAL_CONFIG_ID
    }
    // PATTERN: Return actual entity ID - backend will handle fallback to global config if no instance-specific metadata exists
    return entityId
  }

  if (entityType === 'eventInstance') {
    if (entityId === EVENT_INSTANCE_GLOBAL_CONFIG_ID) {
      return EVENT_INSTANCE_GLOBAL_CONFIG_ID
    }
    if (isPlaceholder || isTemporaryId) {
      return EVENT_INSTANCE_GLOBAL_CONFIG_ID
    }
    return entityId
  }

  if (entityType === 'annotationInstance') {
    if (entityId === ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID) {
      return ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
    }
    if (isPlaceholder || isTemporaryId) {
      return ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
    }
    return entityId
  }

  return entityId
}
