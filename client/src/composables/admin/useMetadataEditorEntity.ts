
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  BLOCK_SHAPE_GLOBAL_CONFIG_ID,
  PART_SHAPE_GLOBAL_CONFIG_ID,
  BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
  PART_INSTANCE_GLOBAL_CONFIG_ID,
  EVENT_SHAPE_GLOBAL_CONFIG_ID,
  EVENT_INSTANCE_GLOBAL_CONFIG_ID,
  ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
  ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
} from '@/utils/entities/entityTypeMapping'

export function useMetadataEditorEntity<
  GlobalEntityTypeKey extends GlobalEntityKey
>(
  entityKey: GlobalEntityTypeKey,
  _entity: GlobalEntity<GlobalEntityTypeKey> | null | undefined,
  blockShapeRef?: string | null
): ComputedRef<GlobalEntity<GlobalEntityTypeKey> | null> {
  return computed(() => {
    // PATTERN: Determine sentinel UUID based on entityKey
    let entityId: string | null = null

    if (entityKey === 'blockShape') {
      entityId = BLOCK_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'partShape') {
      entityId = PART_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'blockInstance') {
      entityId = BLOCK_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'partInstance') {
      entityId = PART_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'eventShape') {
      entityId = EVENT_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'eventInstance') {
      entityId = EVENT_INSTANCE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'annotationShape') {
      entityId = ANNOTATION_SHAPE_GLOBAL_CONFIG_ID
    } else if (entityKey === 'annotationInstance') {
      entityId = ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID
    }

    if (!entityId) {
      return null
    }

    // PATTERN: Build minimal entity object with id, entityKey, and optional blockShapeRef
    const baseEntity = {
      id: entityId,
      entityKey,
      name: '',
    } as GlobalEntity<GlobalEntityTypeKey>

    if (entityKey === 'blockInstance' && blockShapeRef) {
      (baseEntity as GlobalEntity<'blockInstance'>).blockShapeRef = blockShapeRef
    }

    return baseEntity
  })
}
