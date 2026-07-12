
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { BlockInstanceEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import {
  BLOCK_INSTANCE_GLOBAL_CONFIG_ID,
  type EntityMetadataType,
} from './entityTypeMappingIds'

export * from './entityTypeMappingIds'

export function getEntityTypeForMetadata(entityKey: GlobalEntityKey): EntityMetadataType | null {
  if (entityKey === 'blockShape' || entityKey === 'partShape' ||
      entityKey === 'blockInstance' || entityKey === 'partInstance' ||
      entityKey === 'eventShape' || entityKey === 'eventInstance' ||
      entityKey === 'annotationShape' || entityKey === 'annotationInstance') {
    return entityKey as EntityMetadataType
  }

  return null
}

/** Sentinel entity for Global Config row in block instance list (no DB record). */
export function createBlockInstanceConfigSentinel(blockShapeId: string): BlockInstanceEntity {
  return {
    id: toGlobalEntityId(BLOCK_INSTANCE_GLOBAL_CONFIG_ID),
    entityKey: 'blockInstance',
    name: 'Global Config',
    orderIndex: 0,
    wizardVisible: true,
    blockShapeRef: blockShapeId,
    baseSqFt: 0,
    icon: '',
    allowMultiple: false,
    isMultiFamily: false,
    requiresAgent: false,
  }
}
