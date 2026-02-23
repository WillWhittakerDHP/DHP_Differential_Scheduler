/**
 *
 * This utility eliminates the need for if (entityKey === 'blockShape') checks
 * by providing generic mapping functions that work for all entity types.
 */

import type { GlobalEntity } from '@/types/entities'
import type { EntityMetadataType, GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { GLOBAL_CONFIG_IDS, NULL_UUID } from '@shared/constants/globalConfigIds'

export type { EntityMetadataType }

export const BLOCK_SHAPE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.BLOCK_SHAPE
export const PART_SHAPE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.PART_SHAPE
export const PART_INSTANCE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.PART_INSTANCE
export const BLOCK_INSTANCE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.BLOCK_INSTANCE
export const EVENT_SHAPE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.EVENT_SHAPE
export const EVENT_INSTANCE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.EVENT_INSTANCE
export const ANNOTATION_SHAPE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.ANNOTATION_SHAPE
export const ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID = GLOBAL_CONFIG_IDS.ANNOTATION_INSTANCE

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
    return GLOBAL_CONFIG_IDS.BLOCK_SHAPE
  }

  if (entityType === 'partShape') {
    return GLOBAL_CONFIG_IDS.PART_SHAPE
  }

  if (entityType === 'eventShape') {
    return GLOBAL_CONFIG_IDS.EVENT_SHAPE
  }

  if (entityType === 'annotationShape') {
    return GLOBAL_CONFIG_IDS.ANNOTATION_SHAPE
  }

  const entityId = String(entity.id)

  const isPlaceholder = entityId === NULL_UUID

  // PATTERN: Treat IDs starting with TEMPORARY_ID_PATTERNS.NEW_PREFIX as placeholders
  const isTemporaryId = entityId.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)

  if (entityType === 'partInstance') {
    if (entityId === GLOBAL_CONFIG_IDS.PART_INSTANCE) {
      return GLOBAL_CONFIG_IDS.PART_INSTANCE
    }
    if (isPlaceholder || isTemporaryId) {
      return GLOBAL_CONFIG_IDS.PART_INSTANCE
    }
    return entityId
  }

  if (entityType === 'blockInstance') {
    if (isPlaceholder || isTemporaryId) {
      return GLOBAL_CONFIG_IDS.BLOCK_INSTANCE
    }
    return entityId
  }

  if (entityType === 'eventInstance') {
    if (entityId === GLOBAL_CONFIG_IDS.EVENT_INSTANCE) {
      return GLOBAL_CONFIG_IDS.EVENT_INSTANCE
    }
    if (isPlaceholder || isTemporaryId) {
      return GLOBAL_CONFIG_IDS.EVENT_INSTANCE
    }
    return entityId
  }

  if (entityType === 'annotationInstance') {
    if (entityId === GLOBAL_CONFIG_IDS.ANNOTATION_INSTANCE) {
      return GLOBAL_CONFIG_IDS.ANNOTATION_INSTANCE
    }
    if (isPlaceholder || isTemporaryId) {
      return GLOBAL_CONFIG_IDS.ANNOTATION_INSTANCE
    }
    return entityId
  }

  return entityId
}
