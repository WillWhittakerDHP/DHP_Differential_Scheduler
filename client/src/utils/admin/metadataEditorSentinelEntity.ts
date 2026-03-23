import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
  ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
  BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
  BLOCK_SHAPE_GLOBAL_CONFIG_ID,
  EVENT_INSTANCE_GLOBAL_CONFIG_ID,
  EVENT_SHAPE_GLOBAL_CONFIG_ID,
  PART_INSTANCE_GLOBAL_CONFIG_ID,
  PART_SHAPE_GLOBAL_CONFIG_ID,
} from '@/utils/entities/entityTypeMapping'

const SENTINEL_ID_BY_ENTITY_KEY: Partial<Record<GlobalEntityKey, string>> = {
  blockShape: BLOCK_SHAPE_GLOBAL_CONFIG_ID,
  partShape: PART_SHAPE_GLOBAL_CONFIG_ID,
  blockInstance: BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
  partInstance: PART_INSTANCE_GLOBAL_CONFIG_ID,
  eventShape: EVENT_SHAPE_GLOBAL_CONFIG_ID,
  eventInstance: EVENT_INSTANCE_GLOBAL_CONFIG_ID,
  annotationShape: ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
  annotationInstance: ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
}

export function sentinelEntityIdForMetadataEditor(entityKey: GlobalEntityKey): string | null {
  return SENTINEL_ID_BY_ENTITY_KEY[entityKey] ?? null
}

export function buildMetadataEditorStubEntity<GE extends GlobalEntityKey>(
  entityKey: GE,
  entityId: string,
  blockShapeRef?: string | null
): GlobalEntity<GE> {
  const baseEntity = {
    id: entityId,
    entityKey,
    name: '',
  } as GlobalEntity<GE>

  if (entityKey === 'blockInstance' && blockShapeRef) {
    ;(baseEntity as GlobalEntity<'blockInstance'>).blockShapeRef = blockShapeRef
  }

  return baseEntity
}
