
import { Op } from 'sequelize'
import { AdminMetadata } from '../../../db/models/admin/adminMetadata.js'
import { isRelationshipKey } from '../../../constants/relationships.js'
import { GLOBAL_CONFIG_IDS, VALID_ENTITY_TYPES } from './adminMetadataConstants.js'
import {
  adminMetadataToApiEntry,
  fetchSelectOptionsByMetadataIds,
} from '../../../utils/adminMetadataEntryAssembly.js'
import { nilToEmptyArray } from '@shared/utils/nilDefaults.js'

type AdminMetadataEntityType = (typeof VALID_ENTITY_TYPES)[number]

/**
WHY: Matches entity pattern - bac...
 */
export function determineMetadataType(fieldKey: string): 'relationship' | 'primitive' {
  return isRelationshipKey(fieldKey) ? 'relationship' : 'primitive'
}

export function getDefaultPanel(metadataType: 'relationship' | 'primitive'): string {
  return metadataType === 'relationship' ? 'relationships' : 'none'
}

export function resolveBlockInstanceMetadata(
  entityType: string,
  entityId: string,
  blockShapeRef: string | null | undefined
): { finalEntityId: string; finalBlockShapeRef: string | null } {
  if (entityType === 'blockInstance' && blockShapeRef) {
    return {
      finalEntityId: GLOBAL_CONFIG_IDS.BLOCK_INSTANCE,
      finalBlockShapeRef: blockShapeRef,
    }
  }
  
  return {
    finalEntityId: entityId,
    finalBlockShapeRef: null,
  }
}

export function buildMetadataWhereClause(
  entityType: string,
  entityId: string,
  metadataType: 'relationship' | 'primitive',
  fieldKey: string,
  blockShapeRef: string | null | undefined
): Record<string, unknown> {
  const where: Record<string, unknown> = {
    entityType: entityType as AdminMetadataEntityType,
    entityId,
    metadataType,
    fieldKey,
  }
  
  if (entityType === 'blockInstance') {
    where.blockShapeRef = blockShapeRef
  } else {
    where.blockShapeRef = { [Op.is]: null }
  }
  
  return where
}

export async function buildBatchMetadataResult(
  allMetadata: InstanceType<typeof AdminMetadata>[]
): Promise<{
  global: {
    blockShape: Record<string, unknown>
    partShape: Record<string, unknown>
    blockInstance: Record<string, unknown>
    partInstance: Record<string, unknown>
    eventShape: Record<string, unknown>
    eventInstance: Record<string, unknown>
    annotationShape: Record<string, unknown>
    annotationInstance: Record<string, unknown>
  }
  blockShapeSpecific: Record<string, Record<string, unknown>>
}> {
  const optionsMap = await fetchSelectOptionsByMetadataIds(allMetadata.map((m) => m.id))

  const result: {
    global: {
      blockShape: Record<string, unknown>
      partShape: Record<string, unknown>
      blockInstance: Record<string, unknown>
      partInstance: Record<string, unknown>
      eventShape: Record<string, unknown>
      eventInstance: Record<string, unknown>
      annotationShape: Record<string, unknown>
      annotationInstance: Record<string, unknown>
    }
    blockShapeSpecific: Record<string, Record<string, unknown>>
  } = {
    global: {
      blockShape: {},
      partShape: {},
      blockInstance: {},
      partInstance: {},
      eventShape: {},
      eventInstance: {},
      annotationShape: {},
      annotationInstance: {},
    },
    blockShapeSpecific: {},
  }

  for (const entry of allMetadata) {
    const entityType = String(entry.entityType)
    const fieldKey = entry.fieldKey
    const blockShapeRef = entry.blockShapeRef

    const optionRows = nilToEmptyArray(optionsMap.get(entry.id))
    const metadataEntry = adminMetadataToApiEntry(entry, optionRows)

    if (entityType === 'blockInstance' && blockShapeRef) {
      if (!result.blockShapeSpecific[blockShapeRef]) {
        result.blockShapeSpecific[blockShapeRef] = {}
      }
      result.blockShapeSpecific[blockShapeRef][fieldKey] = metadataEntry
    } else {
      const globalByType = (result.global as Record<string, Record<string, unknown>>)[entityType]
      if (globalByType) {
        globalByType[fieldKey] = metadataEntry
      }
    }
  }

  return result
}
