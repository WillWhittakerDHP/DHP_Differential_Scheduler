/**
 * Fetch to Global Transformer
 * 
 * LEARNING: Transforms API responses (snake_case) to GlobalData format (camelCase)
 * WHY: Converts backend database field names to frontend property names
 * PATTERN: Transformer class that handles entity and relationship transformation
 */

import apiClient, { getEntityEndpoint, getRelationshipEndpoint, getEntitiesBatchEndpoint, getRelationshipsBatchEndpoint } from '../api'
import { ENTITY_KEYS } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity, GlobalEntityId } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { FetchedRelationship } from '@/types/relationships'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'

const logger = createLogger('fetchToGlobalTransformer')

/**
 * Transform batch entities response to expected structure
 * LEARNING: Converts batch endpoint response (object keyed by entityKey) to Record<GlobalEntityKey, GlobalEntity[]>
 * WHY: Batch endpoint returns structured object, need to transform each entity type's array
 * PATTERN: Map over ENTITY_KEYS, transform and sort each entity type's data
 * 
 * @param batchResponse - Batch endpoint response with entities keyed by entityKey
 * @returns Transformed entities in expected structure
 */
function transformBatchEntities(
  batchResponse: Record<GlobalEntityKey, Record<string, unknown>[]>
): Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]> {
  return ENTITY_KEYS.reduce((acc, entityKey) => {
    const rawEntities = batchResponse[entityKey] || []
    
    const transformedEntities = rawEntities.map((raw: Record<string, unknown>) => 
      transformApiEntity(raw, entityKey)
    )
    
    const sortedEntities = [...transformedEntities].sort((a, b) => {
      const aOrder = a.orderIndex ?? 0
      const bOrder = b.orderIndex ?? 0
      return aOrder - bOrder
    })
    
    // LEARNING: Handle annotationInstance name migration (text → name)
    // WHY: Backward compatibility - annotationInstance may have text field instead of name
    if (entityKey === 'annotationInstance') {
      const mappedEntities = sortedEntities.map(entity => {
        const entityWithName = entity as unknown as Record<string, unknown>
        if (!entityWithName.name && entityWithName.text) {
          entityWithName.name = entityWithName.text
        }
        return entity
      })
      acc[entityKey] = mappedEntities as GlobalEntity<typeof entityKey>[]
    } else {
      acc[entityKey] = sortedEntities
    }
    
    return acc
  }, {} as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>)
}

/**
 * Transform batch relationships response to flat array
 * LEARNING: Converts batch endpoint response (object keyed by relationshipKey) to flat FetchedRelationship[]
 * WHY: Batch endpoint returns structured object, need to transform and flatten all relationship types
 * PATTERN: Map over RELATIONSHIP_KEYS, transform each relationship type's data, flatten to single array
 * 
 * @param batchResponse - Batch endpoint response with relationships keyed by relationshipKey
 * @returns Transformed relationships as flat array
 */
function transformBatchRelationships(
  batchResponse: Record<GlobalRelationshipKey, Record<string, unknown>[]>
): FetchedRelationship[] {
  const relationshipKeys = Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]
  
  // LEARNING: Transform each relationship type's data, then flatten to single array
  // WHY: Expected structure is flat array of FetchedRelationship objects
  // PATTERN: Map over relationship keys, transform each, then flat() to combine
  return relationshipKeys.flatMap((relationshipKey) => {
    const rawRelationships = batchResponse[relationshipKey] || []
    
    // WHY: Endpoint is /relationships/{relationshipKey}, so we pass relationshipKey to transformer
    // PATTERN: Transform raw API response to expected FetchedRelationship format using relationshipKey
    return rawRelationships.map(raw => transformApiRelationship(raw, relationshipKey))
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
  // PATTERN: Use relationshipKey parameter instead of trying to extract from response
  
  const config = RELATIONSHIP_KEYS[relationshipKey]
  const parentKind = config?.parentEntity ?? ''
  const childKind = config?.childEntity ?? ''
  
  // PATTERN: Handle model-specific field names before falling back to standard parent_id/child_id
  let parentId: string | undefined
  let childId: string | undefined
  
  if (relationshipKey === 'annotationAssignments') {
    parentId = (raw.block_instance_id ?? raw.blockInstanceId ?? raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.annotation_id ?? raw.annotationId ?? raw.child_id ?? raw.childId) as string | undefined
  } else if (relationshipKey === 'attendeeAssignments') {
    parentId = (raw.event_shape_id ?? raw.eventShapeId ?? raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.user_type_block_instance_id ?? raw.userTypeBlockInstanceId ?? raw.child_id ?? raw.childId) as string | undefined
  } else {
    parentId = (raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.child_id ?? raw.childId) as string | undefined
  }
  
  // PATTERN: Use parent_kind from API response to override parentKind
  let parentKindOverride: GlobalEntityKey | undefined
  if (relationshipKey === 'eventAssignments' && raw.parent_kind) {
    parentKindOverride = raw.parent_kind as GlobalEntityKey
  }
  
  // PATTERN: Relationships just indicate which shapes are active - metadata lives in shape tables
  const userTypeBlockBlockInstanceId = raw.userTypeBlockBlockInstanceId ?? raw.user_type_block_block_instance_id
  
  return {
    id: (raw.id ?? '') as GlobalEntityId,
    kind: relationshipKey,
    parent_kind: (parentKindOverride ?? parentKind) as GlobalEntityKey,
    child_kind: childKind as GlobalEntityKey,
    parent_id: (parentId ?? '') as GlobalEntityId,
    child_id: (childId ?? '') as GlobalEntityId,
    disabled: Boolean(raw.disabled ?? false),
    ...(userTypeBlockBlockInstanceId !== undefined && (userTypeBlockBlockInstanceId === null || typeof userTypeBlockBlockInstanceId === 'string') && { userTypeBlockBlockInstanceId: userTypeBlockBlockInstanceId as GlobalEntityId | null }),
  }
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
    } catch (_error) {
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
   * WHY: Creates nested relationship structure expected by transformers
   * PATTERN: Transform flat relationships to nested parent/children structure, attach annotations to entities
   * 
   * ARCHITECTURAL CHANGE: 
   * - Instance components are now fetched and transformed as relationships
   * - Annotations are now fetched separately and attached during hydration (consistent with relationships pattern)
   * 
   * METADATA REFACTOR: Metadata is no longer part of GlobalData
   * WHY: Metadata is lazy-loaded via useMetadataCache() only when admin page is accessed
   */
  hydrate(staged: {
    fetchedEntities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
    fetchedRelationships: FetchedRelationship[]
  }): GlobalData {
    // Attach instanceComponents arrays to entities (for backward compatibility)
    // PATTERN: Extract from relationships instead of separate instanceComponents
    const entities = ENTITY_KEYS.reduce((acc, entityKey) => {
      const entityList = staged.fetchedEntities[entityKey] || []
      
      const componentRels = staged.fetchedRelationships.filter(
        rel => rel.kind === 'instanceComponents' && rel.parent_kind === entityKey && !rel.disabled
      )
      
      const composerMap = componentRels.reduce((map, rel) => {
        const existing = map.get(rel.parent_id) || []
        map.set(rel.parent_id, [...existing, rel.child_id])
        return map
      }, new Map<GlobalEntityId, GlobalEntityId[]>())
      
      // PATTERN: Always set both properties (either with components or cleared)
      acc[entityKey] = entityList.map(entity => {
        const components = composerMap.get(entity.id)
        if (components && components.length > 0) {
          return { ...entity, instanceComponents: components, isComposer: true }
        } else {
          // PATTERN: Explicitly set to undefined/false to clear previous values
          const { instanceComponents: _instanceComponents, ...entityWithoutComponents } = entity
          return { ...entityWithoutComponents, isComposer: false }
        }
      })
      
      return acc
    }, {} as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>)
    
    // LEARNING: Annotations follow the same pattern as entities and relationships
    // PATTERN: No special attachment - annotations accessed via relationships.annotationAssignments like other relationships
    
    // PATTERN: Provide entities for relationship resolution (includes events/annotations)
    const relationships = (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).reduce(
      (acc, relType) => {
        acc[relType] = transformApiRelationships(
          staged.fetchedRelationships, 
          relType, 
          entities
        )
        return acc
      },
      {} as Record<GlobalRelationshipKey, GlobalRelationship[]>
    )
    
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
        .filter(([frontendKey, value]) => frontendKey !== 'entityKey' && value !== undefined)
      return Object.fromEntries(filteredEntries)
    }

    // PATTERN: Use getEntityTypeForMetadata to map entityKey to entityType
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      // PATTERN: Filter entries, then build object from filtered entries
      const filteredEntries = Object.entries(entity)
        .filter(([frontendKey, value]) => frontendKey !== 'entityKey' && value !== undefined)
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

    // WHY: Metadata may incorrectly mark fields as not required, but database schema requires them
    // PATTERN: Use database schema (from model definitions) to determine required fields, override metadata
    const SCHEMA_REQUIRED_BOOLEANS: Record<string, string[]> = {
      partInstance: ['active', 'zeroOutPart'], // NOTE: onSite, clientPresent, moveable removed - now computed from EventAssignment relationships
      blockInstance: ['active', 'composite', 'differential', 'allowMultiple'],
      blockShape: ['composable', 'canHaveParts', 'isStateControl'],
      partShape: [],
    }
    const SCHEMA_NULLABLE_BOOLEANS: Record<string, string[]> = {
      blockInstance: ['requiresUnitNumber'],
      blockShape: [],
      partShape: [],
    }
    // WHY: Metadata may incorrectly mark fields as not required, but database schema requires them
    // PATTERN: Use database schema to determine required number fields for empty string conversion
    const SCHEMA_REQUIRED_NUMBERS: Record<string, string[]> = {
      partInstance: ['baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime'],
      blockInstance: ['baseSqFt'],
      blockShape: [],
      partShape: [],
    }

    // PATTERN: Use schema as source of truth, override metadata when they conflict
    
    const schemaRequiredBooleans = SCHEMA_REQUIRED_BOOLEANS[entityType] || []
    const schemaNullableBooleans = SCHEMA_NULLABLE_BOOLEANS[entityType] || []
    const schemaRequiredNumbers = SCHEMA_REQUIRED_NUMBERS[entityType] || []

    // PATTERN: Use Set constructor with arrays to build Sets functionally
    const schemaNonNullableBooleansSet = new Set(schemaRequiredBooleans)
    const schemaNullableBooleansSet = new Set(schemaNullableBooleans)
    const schemaRequiredNumbersSet = new Set(schemaRequiredNumbers)

    // PATTERN: Reduce metadata entries to arrays, then build Sets from arrays
    const metadataRequiredFields = Object.entries(metadata)
      .filter(([, fieldMetadata]) => fieldMetadata.isRequired)
      .map(([fieldKey]) => fieldKey)

    // PATTERN: Use spread operator to create new arrays instead of mutating
    const metadataBooleanFields = Object.entries(metadata)
      .filter(([fieldKey, fieldMetadata]) => 
        fieldMetadata.dataType === 'boolean' &&
        !schemaNonNullableBooleansSet.has(fieldKey) &&
        !schemaNullableBooleansSet.has(fieldKey)
      )
      .reduce((acc, [fieldKey, fieldMetadata]) => {
        if (fieldMetadata.isRequired) {
          return { ...acc, nonNullable: [...acc.nonNullable, fieldKey] }
        } else {
          return { ...acc, nullable: [...acc.nullable, fieldKey] }
        }
      }, { nonNullable: [] as string[], nullable: [] as string[] })

    const metadataRequiredNumbers = Object.entries(metadata)
      .filter(([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'number' &&
        fieldMetadata.isRequired &&
        !schemaRequiredNumbersSet.has(fieldKey)
      )
      .map(([fieldKey]) => fieldKey)

    // PATTERN: Use Set constructor with spread arrays to combine sources immutably
    const nullableBooleanFields = new Set([
      ...schemaNullableBooleans,
      ...metadataBooleanFields.nullable
    ])
    const nonNullableBooleanFields = new Set([
      ...schemaRequiredBooleans,
      ...metadataBooleanFields.nonNullable
    ])
    const requiredNumberFields = new Set([
      ...schemaRequiredNumbers,
      ...metadataRequiredNumbers
    ])
    const requiredFields = new Set([
      ...schemaRequiredBooleans,
      ...schemaRequiredNumbers,
      ...metadataRequiredFields
    ]) // Track all required fields (not just booleans)

    /**
     * LEARNING: Extract field transformation logic to pure function
     * WHY: Separates transformation logic from iteration
     * PATTERN: Pure function that transforms a single field entry
     */
    const transformField = ([frontendKey, value]: [string, unknown]): [string, unknown] | null => {
      if (frontendKey === 'entityKey') return null // Skip entityKey, backend doesn't need it
      
      if (value === undefined) {
        // PATTERN: For required fields, use appropriate default based on dataType
        if (requiredFields.has(frontendKey)) {
          const fieldMetadata = metadata[frontendKey]
          if (fieldMetadata) {
            // PATTERN: Let Sequelize validate and return clear error if required reference field is missing
            if (fieldMetadata.dataType === 'reference') {
              return null // Skip undefined required reference fields - let Sequelize validate
            }
            if (fieldMetadata.dataType === 'boolean') {
              return [frontendKey, false] // Required booleans default to false
            } else if (fieldMetadata.dataType === 'number') {
              return [frontendKey, 0] // Required numbers default to 0
            } else if (fieldMetadata.dataType === 'string') {
              return [frontendKey, ''] // Required strings default to empty string
            }
          }
        }
        return null // Skip undefined values for non-required fields
      }
      
      // PATTERN: Check if field is required reference and send null, otherwise skip
      if (value === null) {
        const fieldMetadata = metadata[frontendKey]
        const isReferenceField = fieldMetadata?.dataType === 'reference' || 
                                 frontendKey.endsWith('Ref') || 
                                 frontendKey.endsWith('Id') ||
                                 frontendKey === 'id'
        
        if (isReferenceField) {
          if (requiredFields.has(frontendKey)) {
            return [frontendKey, null] // Send null for required reference fields
          }
          return null
        }
      }
      
      //      UUID fields cannot accept empty strings - they must be valid UUIDs or null
      // PATTERN: Check if field is boolean, number, or reference and convert empty string appropriately
      if (value === '') {
        if (nullableBooleanFields.has(frontendKey) || nonNullableBooleanFields.has(frontendKey)) {
          const convertedValue = nullableBooleanFields.has(frontendKey) ? null : false
          return [frontendKey, convertedValue]
        } else if (requiredNumberFields.has(frontendKey)) {
          return [frontendKey, 0]
        } else {
          // PATTERN: Convert empty strings to null for reference fields, let Sequelize handle required field validation
          const fieldMetadata = metadata[frontendKey]
          const isReferenceField = fieldMetadata?.dataType === 'reference' || 
                                   frontendKey.endsWith('Ref') || 
                                   frontendKey.endsWith('Id') ||
                                   frontendKey === 'id'
          
          if (isReferenceField && typeof value === 'string' && value === '') {
            // Sequelize will validate required fields and provide clear error if field is required
            return [frontendKey, null]
          }
          
          return [frontendKey, value]
        }
      } else {
        return [frontendKey, value]
      }
    }

    // PATTERN: Map entries to transformed entries, filter nulls, build object
    const transformedEntries = Object.entries(entity)
      .map(transformField)
      .filter((entry): entry is [string, unknown] => entry !== null)
    
    return Object.fromEntries(transformedEntries)
  }
}

export const globalTransformer = new GlobalTransformer()

