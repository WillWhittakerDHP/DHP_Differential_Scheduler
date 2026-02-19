/**
 * Fetch to Global Transformer
 *
 * LEARNING: Transforms API responses (snake_case) to GlobalData format (camelCase)
 * WHY: Converts backend database field names to frontend property names
 * PATTERN: Transformer class that handles entity and relationship transformation
 */

import apiClient, { getEntitiesBatchEndpoint, getRelationshipsBatchEndpoint } from '../api'
import { ENTITY_KEYS } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId, toGlobalEntityIdOrNull, type GlobalEntity } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { FetchedRelationship } from '@/types/relationships'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import { buildFieldClassificationSets, transformFieldForDehydrate } from './fieldClassification'
import { safeArray, safeString, safeId } from './transformerPrimitives'
import { groupByParentId, immutableSort } from './transformerCollections'

const logger = createLogger('fetchToGlobalTransformer')

const LOG_STAGE_HYDRATION_FAILED = 'Failed to stage data for hydration'

/**
 * Apply name fallback for annotationInstance: use text as name when name is missing.
 * LEARNING: API may return annotation with text but no name; frontend expects name.
 */
function applyAnnotationInstanceNameFallback(
  entities: GlobalEntity<'annotationInstance'>[]
): GlobalEntity<'annotationInstance'>[] {
  return entities.map((entity) => {
    if (entity.name != null) return entity
    if (entity.text != null) return { ...entity, name: String(entity.text) } as GlobalEntity<'annotationInstance'>
    return entity
  })
}

/**
 * Transform batch entities response to expected structure
 * LEARNING: Converts batch endpoint response (object keyed by entityKey) to Record<GlobalEntityKey, GlobalEntity[]>
 * WHY: Batch endpoint returns structured object, need to transform each entity type's array
 * PATTERN: Map over ENTITY_KEYS, transform and sort each entity type's data
 */
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

/**
 * Transform batch relationships response to flat array
 * LEARNING: Converts batch endpoint response (object keyed by relationshipKey) to flat FetchedRelationship[]
 * PATTERN: Map over RELATIONSHIP_KEYS, transform each relationship type's data, flatten to single array
 */
function transformBatchRelationships(
  batchResponse: Record<GlobalRelationshipKey, Record<string, unknown>[]>
): FetchedRelationship[] {
  const relationshipKeys = Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]
  return relationshipKeys.flatMap((relationshipKey) => {
    const rawRelationships = safeArray(batchResponse[relationshipKey])
    return rawRelationships.map((raw) => transformApiRelationship(raw, relationshipKey))
  })
}

/**
 * GlobalRelationship type matching React's structure
 * LEARNING: Nested structure with parent and children arrays
 * WHY: Matches format expected by scheduler transformer
 */
export type GlobalRelationship<GE extends GlobalEntityKey = GlobalEntityKey> = {
  relationshipKind: GlobalRelationshipKey
  parent: GlobalEntity<GE>
  children: GlobalEntity<GE>[]
}

/**
 * GlobalData type - matches React's structure
 * LEARNING: Entities and relationships organized by type
 * WHY: Consistent data structure across React and Vue apps
 * 
 * ARCHITECTURAL CHANGE: instanceComponents are now in relationships.instanceComponents
 * This makes components consistent with other relationship types (validCascades, bookingCascades, etc.)
 * 
 * ARCHITECTURAL REFACTOR: Removed business entities (appointments, properties, users) from globalData
 * WHY: Business data changes frequently and should have separate cache keys for granular invalidation
 * PATTERN: Keep only static configuration data (entities, relationships) in globalData
 * Business entities (appointments, properties, users) use separate cache key: ['businessData']
 * 
 * Session 1.4.6: Added annotations to globalData cache
 * WHY: Annotations are configuration data that changes infrequently
 * PATTERN: Keep annotations in globalData as they're part of configuration
 * 
 * Session 1.4.7: Added annotationShapes to globalData cache
 * WHY: AnnotationShapes are configuration data (like blockShape), not business data
 * PATTERN: Keep all configuration data together in globalData for unified cache management
 * NOTE: Renamed from annotationShapes to annotationShapes (2026-01-30)
 * 
 * METADATA REFACTOR: Removed metadata from globalData
 * WHY: Metadata is only needed for admin page - lazy load via ['adminMetadata'] cache instead
 * PATTERN: Use useMetadataCache() composable for admin metadata access
 * BENEFIT: Non-admin users don't load metadata, faster app startup
 */
export type GlobalData = {
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
}


/**
 * Resolve parent/child ID fields from raw API response by relationship kind.
 * LEARNING: Some relationship types use alternate field names (e.g. annotationAssignments use blockInstanceId/annotationId).
 */
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
 * Transform API relationship response to FetchedRelationship format
 * LEARNING: Converts API response field names to expected frontend format
 * WHY: API endpoint already filters by relationship type, so response doesn't include 'kind'
 *      We use the relationshipKey parameter to set kind and get parent/child entity types from config
 * PATTERN: Use relationshipKey to determine kind and entity types, handle snake_case/camelCase for IDs
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
    id: toGlobalEntityId(idResolved ?? ''),
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

/**
 * Attach instanceComponents arrays to entities for backward compatibility.
 * LEARNING: instanceComponents are now in relationships; this keeps entity.instanceComponents in sync.
 * PATTERN: Use groupByParentId for parent -> childIds; then map entities to attach or clear.
 */
function attachLegacyInstanceComponents(
  fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  fetchedRelationships: FetchedRelationship[]
): Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]> {
  return Object.fromEntries(
    ENTITY_KEYS.map((entityKey) => {
      const entityList = safeArray(fetchedEntities[entityKey])
      // @audit-allow:loop-mutation:assignProp - read-only filter callback, no mutation
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
 * Global Transformer Class
 * LEARNING: Transforms API responses to GlobalData format
 * WHY: Centralizes data transformation logic
 * PATTERN: Class-based transformer matching React's structure
 */
export class GlobalTransformer {
  /**
   * Stage entities, relationships, and annotations for hydration
   * LEARNING: Fetches all data from API and transforms field names
   * WHY: Prepares data for transformation to GlobalData format
   * PATTERN: Fetch -> Transform -> Hydrate
   * 
   * ARCHITECTURAL CHANGE: 
   * - instanceComponents are now fetched via relationship endpoint
   * - Annotations are now fetched separately (consistent with relationships pattern)
   * 
   * METADATA REFACTOR: Metadata is no longer fetched here
   * WHY: Metadata is lazy-loaded via useMetadataCache() only when admin page is accessed
   * BENEFIT: Non-admin users don't load metadata, faster app startup
   */
  async stageForHydration(): Promise<{
    fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
    fetchedRelationships: FetchedRelationship[]
  }> {
    try {
      // LEARNING: Use batch endpoints to reduce N+18 HTTP requests to 2 requests
      // WHY: Dramatically improves initial load performance, reduces network overhead
      // PATTERN: Fetch entities and relationships in parallel using batch endpoints
      // @audit-allow:loop-mutation:assignIndex - destructuring Promise.all result, not loop mutation
      const [entitiesResponse, relationshipsResponse] = await Promise.all([
        apiClient.get<Record<GlobalEntityKey, Record<string, unknown>[]>>(getEntitiesBatchEndpoint()),
        apiClient.get<Record<GlobalRelationshipKey, Record<string, unknown>[]>>(getRelationshipsBatchEndpoint())
      ])

      // LEARNING: Transform batch entities response to expected structure
      // WHY: Batch endpoint returns object keyed by entityKey, need to transform each array
      // PATTERN: Map over ENTITY_KEYS, transform each entity type's data
      const fetchedEntities = transformBatchEntities(entitiesResponse.data)

      // LEARNING: Transform batch relationships response to flat array
      // WHY: Batch endpoint returns object keyed by relationshipKey, need to flatten and transform
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

  /**
   * Hydrate staged data into final GlobalData format
   * LEARNING: Resolves relationships and annotations, creates final data structure
   * PATTERN: Transform flat relationships to nested parent/children structure.
   * NOTE: attachLegacyInstanceComponents remains until consumers (serviceSelectionConfigBuilders,
   * selectionCardChildren, usePropertyTypeBlockConfig, globalToAdminTransformer tests) no longer
   * read entity.instanceComponents; they currently depend on it for composite block display.
   */
  hydrate(staged: {
    fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
    fetchedRelationships: FetchedRelationship[]
  }): GlobalData {
    const entities = attachLegacyInstanceComponents(
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

  /**
   * Dehydrate entity: Transform frontend field names to backend field names
   * LEARNING: All models now use underscored: true with camelCase properties
   * WHY: Sequelize expects camelCase properties and automatically converts to snake_case columns
   * PATTERN: Return entity as-is with camelCase - Sequelize handles conversion internally
   * 
   * LEARNING: Dynamic boolean field detection from metadata
   * WHY: No hardcoded field lists - automatically includes all boolean fields from metadata
   * PATTERN: Uses metadata cache to determine boolean fields and their nullable status
   * 
   * @param entity - Entity with frontend field names (camelCase), must include entityKey property
   * @returns Entity with camelCase properties (Sequelize converts to snake_case internally)
   */
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
      // @audit-allow:loop-mutation:assignIndex - type guard filter, no mutation
      .filter((entry): entry is [string, unknown] => entry !== null)
    return Object.fromEntries(transformedEntries)
  }
}

export const globalTransformer = new GlobalTransformer()

