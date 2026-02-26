/**
 * WHY: Fetch to Global Transformer
LEARNING: Transforms API responses (snake_ca...
 */
import apiClient, { getEntitiesBatchEndpoint, getRelationshipsBatchEndpoint } from '../api'
import { ENTITY_KEYS } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId, toGlobalEntityIdOrNull } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { FetchedRelationship, GlobalRelationship } from '@/types/relationships'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'
import { buildFieldClassificationSets, transformFieldForDehydrate } from './fieldClassification'
import { safeArray, safeString, safeId } from './transformerPrimitives'
import { groupByParentId, immutableSort } from './transformerCollections'
import type { GlobalData } from '@/types/transformers/globalData'

export type { GlobalData } from '@/types/transformers/globalData'

const logger = createLogger('fetchToGlobalTransformer')

const LOG_STAGE_HYDRATION_FAILED = 'Failed to stage data for hydration'

function applyAnnotationInstanceNameFallback(
  entities: GlobalEntity<'annotationInstance'>[]
): GlobalEntity<'annotationInstance'>[] {
  return entities.map((entity) => {
    if (entity.name != null) return entity
    if (entity.text != null) return { ...entity, name: String(entity.text) } as GlobalEntity<'annotationInstance'>
    return entity
  })
}

function transformBatchEntities(
  batchResponse: Record<GlobalEntityKey, Record<string, unknown>[]>
): Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]> {
  const orderCompare = (a: { orderIndex?: number }, b: { orderIndex?: number }) =>
    (a.orderIndex ?? 0) - (b.orderIndex ?? 0)

  return Object.fromEntries(
    ENTITY_KEYS.map((entityKey) => {
      const rawEntities = safeArray(batchResponse[entityKey])
      const transformedEntities = rawEntities.map((raw: Record<string, unknown>) =>
        transformApiEntity(raw, entityKey)
      )
      const sortedEntities = immutableSort(transformedEntities, orderCompare)
      const result =
        entityKey === 'annotationInstance'
          ? (applyAnnotationInstanceNameFallback(
              sortedEntities as GlobalEntity<'annotationInstance'>[]
            ) as GlobalEntity<GlobalEntityKey>[])
          : sortedEntities
      return [entityKey, result]
    })
  ) as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
}

function transformBatchRelationships(
  batchResponse: Record<GlobalRelationshipKey, Record<string, unknown>[]>
): FetchedRelationship[] {
  const relationshipKeys = Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]
  return relationshipKeys.flatMap((relationshipKey) => {
    const rawRelationships = safeArray(batchResponse[relationshipKey])
    return rawRelationships.map((raw) => transformApiRelationship(raw, relationshipKey))
  })
}

function resolveRelationshipIds(
  raw: Record<string, unknown>,
  relationshipKey: GlobalRelationshipKey
): { parentId: string; childId: string } {
  let parentIdRaw: unknown
  let childIdRaw: unknown
  if (relationshipKey === 'annotationAssignments') {
    parentIdRaw = raw.blockInstanceId ?? raw.parentId
    childIdRaw = raw.annotationId ?? raw.childId
  } else if (relationshipKey === 'attendeeAssignments') {
    parentIdRaw = raw.eventShapeId ?? raw.parentId
    childIdRaw = raw.userTypeBlockInstanceId ?? raw.childId
  } else {
    parentIdRaw = raw.parentId
    childIdRaw = raw.childId
  }
  const parentIdResolved = safeId(parentIdRaw)
  const childIdResolved = safeId(childIdRaw)
  if (parentIdResolved === undefined) {
    logger.debug('resolveRelationshipIds: parentId missing after safeId', { raw: parentIdRaw })
  }
  if (childIdResolved === undefined) {
    logger.debug('resolveRelationshipIds: childId missing after safeId', { raw: childIdRaw })
  }
  return {
    parentId: parentIdResolved != null ? parentIdResolved : '',
    childId: childIdResolved != null ? childIdResolved : '',
  }
}

/**
 * WHY: Transform API relationship response to FetchedRelationship format
LEARNI...
 */
function transformApiRelationship(
  raw: Record<string, unknown>,
  relationshipKey: GlobalRelationshipKey
): FetchedRelationship {
  const config = RELATIONSHIP_KEYS[relationshipKey]
  const parentKind = safeString(config?.parentEntity, 'RELATIONSHIP_KEYS.parentEntity')
  const childKind = safeString(config?.childEntity, 'RELATIONSHIP_KEYS.childEntity')
  const { parentId, childId } = resolveRelationshipIds(raw, relationshipKey)

  const parentKindOverride =
    relationshipKey === 'eventAssignments' && raw.parentKind
      ? (raw.parentKind as GlobalEntityKey)
      : undefined
  const userTypeBlockBlockInstanceId = raw.userTypeBlockBlockInstanceId

  const idResolved = safeId(raw.id)
  if (idResolved === undefined) {
    logger.debug('transformApiRelationship: id missing after safeId', { rawId: raw.id })
  }
  return {
    id: toGlobalEntityId(asEmptyString(idResolved)),
    kind: relationshipKey,
    parentKind: (parentKindOverride ?? parentKind) as GlobalEntityKey,
    childKind: childKind as GlobalEntityKey,
    parentId: toGlobalEntityId(parentId),
    childId: toGlobalEntityId(childId),
    disabled: Boolean(raw.disabled ?? false),
    ...(userTypeBlockBlockInstanceId !== undefined &&
      (userTypeBlockBlockInstanceId === null ||
        typeof userTypeBlockBlockInstanceId === 'string') && {
        userTypeBlockBlockInstanceId: toGlobalEntityIdOrNull(userTypeBlockBlockInstanceId),
      }),
  }
}

/** Attach instanceComponents arrays to entities. */
function attachInstanceComponents(
  fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  fetchedRelationships: FetchedRelationship[]
): Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]> {
  return Object.fromEntries(
    ENTITY_KEYS.map((entityKey) => {
      const entityList = safeArray(fetchedEntities[entityKey])
      const componentRels = fetchedRelationships.filter(
        (rel) =>
          rel.kind === 'instanceComponents' && rel.parentKind === entityKey && !rel.disabled
      )
      const composerMap = groupByParentId(
        componentRels,
        (r) => r.parentId,
        (r) => r.childId
      )
      const list = entityList.map((entity) => {
        const components = composerMap.get(entity.id)
        if (components && components.length > 0) {
          return { ...entity, instanceComponents: components, isComposer: true }
        }
        const { instanceComponents: _instanceComponents, ...entityWithoutComponents } = entity
        return { ...entityWithoutComponents, isComposer: false }
      })
      return [entityKey, list]
    })
  ) as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
}

/**
 * WHY: Global Transformer Class
LEARNING: Transforms API responses to GlobalDat...
 */
export class GlobalTransformer {
  async stageForHydration(): Promise<{
    fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
    fetchedRelationships: FetchedRelationship[]
  }> {
    try {
      // PATTERN: Fetch entities and relationships in parallel using batch endpoints
      const [entitiesResponse, relationshipsResponse] = await Promise.all([
        apiClient.get<Record<GlobalEntityKey, Record<string, unknown>[]>>(getEntitiesBatchEndpoint()),
        apiClient.get<Record<GlobalRelationshipKey, Record<string, unknown>[]>>(getRelationshipsBatchEndpoint())
      ])

      // PATTERN: Map over ENTITY_KEYS, transform each entity type's data
      const fetchedEntities = transformBatchEntities(entitiesResponse.data)

      // PATTERN: Map over RELATIONSHIP_KEYS, transform each relationship type's data, flatten
      const fetchedRelationships = transformBatchRelationships(relationshipsResponse.data)
      
      return {
        fetchedEntities,
        fetchedRelationships,
      }
    } catch (error) {
      logger.error(LOG_STAGE_HYDRATION_FAILED, { error })
      return {
        fetchedEntities: {
          blockInstance: [],
          blockShape: [],
          partInstance: [],
          partShape: [],
          eventShape: [],
          eventInstance: [],
          annotationShape: [],
          annotationInstance: [],
        },
        fetchedRelationships: [],
      }
    }
  }

  hydrate(staged: {
    fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
    fetchedRelationships: FetchedRelationship[]
  }): GlobalData {
    const entities = attachInstanceComponents(
      staged.fetchedEntities,
      staged.fetchedRelationships
    )
    
    // LEARNING: Annotations follow the same pattern as entities and relationships
    // PATTERN: No special attachment - annotations accessed via relationships.annotationAssignments like other relationships
    
    // PATTERN: Provide entities for relationship resolution (includes events/annotations)
    const relationshipKeys = Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]
    const relationships = Object.fromEntries(
      relationshipKeys.map((relType) => [
        relType,
        transformApiRelationships(staged.fetchedRelationships, relType, entities),
      ])
    ) as Record<GlobalRelationshipKey, GlobalRelationship[]>
    
    return {
      entities,
      relationships,
    }
  }

  dehydrateEntity<GE extends GlobalEntityKey>(
    entity: Partial<GlobalEntity<GE>> & { entityKey?: GE }
  ): Record<string, unknown> {

    // LEARNING: Extract entityKey from entity to determine entity type
    // PATTERN: Extract entityKey from entity parameter (it's included in mutation calls)
    const entityKey = entity.entityKey
    if (!entityKey) {
      // PATTERN: Filter entries, then build object from filtered entries
      const filteredEntries = Object.entries(entity)
        .filter(([frontendKey, value]) => frontendKey !== FIELD_NAMES.ENTITY_KEY && value !== undefined)
      return Object.fromEntries(filteredEntries)
    }

    // PATTERN: Use getEntityTypeForMetadata to map entityKey to entityType
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      // PATTERN: Filter entries, then build object from filtered entries
      const filteredEntries = Object.entries(entity)
        .filter(([frontendKey, value]) => frontendKey !== FIELD_NAMES.ENTITY_KEY && value !== undefined)
      return Object.fromEntries(filteredEntries)
    }

    // PATTERN: Use metadata cache to get field metadata for this entity type
    let metadataCache
    let metadata: Record<string, FieldMetadataEntry> = {}
    try {
      metadataCache = useMetadataCache()
      metadata = metadataCache.getMetadata(entityType)
    } catch (error) {
      logger.debug('Metadata cache not available, using schema defaults', { error, entityType })
    }

    const fieldSets = buildFieldClassificationSets(entityType, metadata)
    const transformedEntries = Object.entries(entity)
      .map((entry) => transformFieldForDehydrate(entry, fieldSets, metadata))
      .filter((entry): entry is [string, unknown] => entry !== null)
    return Object.fromEntries(transformedEntries)
  }
}

export const globalTransformer = new GlobalTransformer()

