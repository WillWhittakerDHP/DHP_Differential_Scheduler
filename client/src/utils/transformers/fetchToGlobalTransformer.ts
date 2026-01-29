/**
 * Fetch to Global Transformer
 * 
 * LEARNING: Transforms API responses (snake_case) to GlobalData format (camelCase)
 * WHY: Converts backend database field names to frontend property names
 * PATTERN: Transformer class that handles entity and relationship transformation
 */

import apiClient, { getEntityEndpoint, getRelationshipEndpoint, getAnnotationEndpoint, getAnnotationAssignmentsEndpoint, getAnnotationTypeEndpoint } from '../api'
import { ENTITY_KEYS } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity, GlobalEntityId, BlockInstanceEntity } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { FetchedRelationship } from '@/types/relationships'
import type { Annotation, AnnotationType } from '@/types/annotations'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { transformApiAnnotation, groupAnnotationsByEntity } from './annotationTransformers'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'

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
 * Session 1.4.7: Added annotationTypes to globalData cache
 * WHY: AnnotationTypes are configuration data (like blockShape), not business data
 * PATTERN: Keep all configuration data together in globalData for unified cache management
 * 
 * METADATA REFACTOR: Removed metadata from globalData
 * WHY: Metadata is only needed for admin page - lazy load via ['adminMetadata'] cache instead
 * PATTERN: Use useMetadataCache() composable for admin metadata access
 * BENEFIT: Non-admin users don't load metadata, faster app startup
 */
export type GlobalData = {
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
  // NOTE: instanceComponents are now stored in relationships.instanceComponents as GlobalRelationship[]
  // Session 1.4.6: Annotations added to globalData cache (configuration data)
  annotations?: Annotation[]
  // Session 1.4.7: AnnotationTypes added to globalData cache (configuration data)
  annotationTypes?: AnnotationType[]
  // NOTE: Metadata removed from globalData - use useMetadataCache() for admin metadata access
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
  // LEARNING: API endpoint already filters by relationship type, so response doesn't include 'kind'
  // WHY: Endpoint is /relationships/instanceComponents, so we know it's instanceComponents
  // PATTERN: Use relationshipKey parameter instead of trying to extract from response
  
  // Get parent and child entity types from RELATIONSHIP_KEYS config
  const config = RELATIONSHIP_KEYS[relationshipKey]
  const parentKind = config?.parentEntity ?? ''
  const childKind = config?.childEntity ?? ''
  
  // Handle both snake_case and camelCase for IDs
  const parentId = raw.parent_id ?? raw.parentId
  const childId = raw.child_id ?? raw.childId
  
  return {
    id: (raw.id ?? '') as GlobalEntityId,
    kind: relationshipKey,
    parent_kind: parentKind as GlobalEntityKey,
    child_kind: childKind as GlobalEntityKey,
    parent_id: (parentId ?? '') as GlobalEntityId,
    child_id: (childId ?? '') as GlobalEntityId,
    disabled: Boolean(raw.disabled ?? false),
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
    fetchedAnnotations: Annotation[]
    fetchedAnnotationTypes: AnnotationType[]
    fetchedAnnotationAssignments: Array<{
      id: string
      blockInstanceId: string
      annotationId: string
      userTypeBlockBlockInstanceId: GlobalEntityId | null
      orderIndex: number
      isDefault: boolean
      annotation?: Annotation
    }>
  }> {
    try {
      // LEARNING: Fetch all entities in parallel using same processor pattern
      // WHY: Consistent parallel fetching pattern across all data types
      // PATTERN: map() → Promise.all() for parallel execution
      // NOTE: All 4 entity types (blockInstance, blockShape, partInstance, partShape) fetched in parallel
      const entityPromises = ENTITY_KEYS.map(async (entityKey) => {
        const endpoint = getEntityEndpoint(entityKey)
        const response = await apiClient.get<Record<string, unknown>[]>(endpoint)
        
        // Transform API responses (snake_case) to frontend format (camelCase)
        const transformedEntities = response.data.map((raw: Record<string, unknown>) => 
          transformApiEntity(raw, entityKey)
        )
        
        // Sort by orderIndex
        const sortedEntities = [...transformedEntities].sort((a, b) => {
          const aOrder = a.orderIndex ?? 0
          const bOrder = b.orderIndex ?? 0
          return aOrder - bOrder
        })
        
        return { entityKey, normalizedEntities: sortedEntities }
      })
      
      const entityResults = await Promise.all(entityPromises)
      const fetchedEntities = entityResults.reduce((acc, { entityKey, normalizedEntities }) => {
        acc[entityKey] = normalizedEntities
        return acc
      }, {} as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>)
      
      // LEARNING: Fetch all relationships in parallel using same processor pattern
      // WHY: Consistent parallel fetching pattern across all data types
      // PATTERN: map() → Promise.all() for parallel execution
      // NOTE: All 6 relationship types (validCascades, validParts, dependentInstances, bookingCascades, activeParts, instanceComponents) fetched in parallel
      const relationshipPromises = (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).map(async (relationshipKey) => {
        const endpoint = getRelationshipEndpoint(relationshipKey)
        const response = await apiClient.get<Record<string, unknown>[]>(endpoint)
        
        // Transform each relationship from API format to FetchedRelationship format
        // LEARNING: API endpoint already filters by relationship type, so response doesn't include 'kind'
        // WHY: Endpoint is /relationships/{relationshipKey}, so we pass relationshipKey to transformer
        // PATTERN: Transform raw API response to expected FetchedRelationship format using relationshipKey
        return response.data.map(raw => transformApiRelationship(raw, relationshipKey))
      })
      
      const relationshipResults = await Promise.all(relationshipPromises)
      const fetchedRelationships = relationshipResults.flat()
      
      // LEARNING: Fetch all annotations, annotation types, and assignments in parallel using same processor pattern
      // WHY: Consistent parallel fetching pattern across all data types
      // PATTERN: Promise.all() for parallel execution
      // NOTE: Annotations, annotation types, and assignments fetched in parallel
      // ARCHITECTURAL REFACTOR: Removed business entity fetching (appointments, properties, users)
      // WHY: Business entities use separate cache key ['businessData'] and are fetched by useBusiness composable
      // Session 1.4.7: Added annotation types to parallel fetch (configuration data belongs in globalData)
      const [annotationsResponse, annotationTypesResponse, assignmentsResponse] = await Promise.all([
        apiClient.get<Record<string, unknown>[]>(getAnnotationEndpoint()),
        apiClient.get<AnnotationType[]>(getAnnotationTypeEndpoint()),
        apiClient.get<Array<Record<string, unknown>>>(getAnnotationAssignmentsEndpoint())
      ])
      
      // Transform annotations
      const fetchedAnnotations = annotationsResponse.data.map(raw => transformApiAnnotation(raw))
      
      // Transform assignments (extract from Sequelize include structure)
      const fetchedAnnotationAssignments = assignmentsResponse.data.map((raw: Record<string, unknown>) => {
        const annotation = raw.annotation as Record<string, unknown> | undefined
        // Transform full annotation if present (includes type and annotationType)
        const transformedAnnotation = annotation ? transformApiAnnotation(annotation) : undefined
        return {
          id: typeof raw.id === 'string' ? raw.id : '',
          blockInstanceId: typeof raw.blockInstanceId === 'string' ? raw.blockInstanceId : (typeof raw.block_instance_id === 'string' ? raw.block_instance_id : ''),
          annotationId: typeof raw.annotationId === 'string' ? raw.annotationId : (typeof raw.annotation_id === 'string' ? raw.annotation_id : ''),
          userTypeBlockBlockInstanceId: (raw.userTypeBlockBlockInstanceId ?? raw.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
          orderIndex: (raw.orderIndex ?? raw.order_index ?? 0) as number,
          isDefault: (raw.isDefault ?? raw.is_default ?? false) as boolean,
          annotation: transformedAnnotation
        }
      })
      
      // LEARNING: Validation logging to verify all data types are loaded
      // WHY: Helps debug missing data and ensures all expected types are present
      // PATTERN: Log counts for each data type in dev mode
      
      // Session 1.4.7: Extract annotation types from response
      const fetchedAnnotationTypes = annotationTypesResponse.data
      
      // NOTE: Metadata is no longer fetched here
      // WHY: Metadata is lazy-loaded via useMetadataCache() only when admin page is accessed
      // BENEFIT: Non-admin users don't load metadata, faster app startup
      
      return {
        fetchedEntities,
        fetchedRelationships,
        fetchedAnnotations,
        fetchedAnnotationTypes,
        fetchedAnnotationAssignments,
      }
    } catch (_error) {
      return {
        fetchedEntities: {
          blockInstance: [],
          blockShape: [],
          partInstance: [],
          partShape: [],
        },
        fetchedRelationships: [],
        fetchedAnnotations: [],
        fetchedAnnotationTypes: [],
        fetchedAnnotationAssignments: [],
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
    fetchedAnnotations: Annotation[]
    fetchedAnnotationTypes: AnnotationType[]
    fetchedAnnotationAssignments: Array<{
      id: string
      blockInstanceId: string
      annotationId: string
      userTypeBlockBlockInstanceId: GlobalEntityId | null
      orderIndex: number
      isDefault: boolean
      annotation?: Annotation
    }>
  }): GlobalData {
    // Session 1.4.6: Extract annotations from staged data
    const fetchedAnnotations = staged.fetchedAnnotations || []
    // Session 1.4.7: Extract annotation types from staged data
    const fetchedAnnotationTypes = staged.fetchedAnnotationTypes || []
    
    // Attach instanceComponents arrays to entities (for backward compatibility)
    // LEARNING: This metadata helps identify composers, but components are computed from relationships
    // WHY: Some code may still check isComposer flag
    // PATTERN: Extract from relationships instead of separate instanceComponents
    // LEARNING: Use reduce to create new entities object instead of mutating in place
    const entities = ENTITY_KEYS.reduce((acc, entityKey) => {
      const entityList = staged.fetchedEntities[entityKey] || []
      
      // Find component relationships for this entity kind
      const componentRels = staged.fetchedRelationships.filter(
        rel => rel.kind === 'instanceComponents' && rel.parent_kind === entityKey && !rel.disabled
      )
      
      // Group by composer (parent)
      const composerMap = componentRels.reduce((map, rel) => {
        const existing = map.get(rel.parent_id) || []
        map.set(rel.parent_id, [...existing, rel.child_id])
        return map
      }, new Map<GlobalEntityId, GlobalEntityId[]>())
      
      // Attach instanceComponents to composers
      // LEARNING: Explicitly clear instanceComponents and isComposer for entities without components
      // WHY: Prevents stale data from previous loads when database is empty
      // PATTERN: Always set both properties (either with components or cleared)
      // LEARNING: Use map to create new entities instead of mutating in place
      acc[entityKey] = entityList.map(entity => {
        const components = composerMap.get(entity.id)
        if (components && components.length > 0) {
          return { ...entity, instanceComponents: components, isComposer: true }
        } else {
          // LEARNING: Clear instanceComponents and isComposer when no components exist
          // WHY: Prevents stale data from showing components that don't exist in database
          // PATTERN: Explicitly set to undefined/false to clear previous values
          const { instanceComponents: _instanceComponents, ...entityWithoutComponents } = entity
          return { ...entityWithoutComponents, isComposer: false }
        }
      })
      
      return acc
    }, {} as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>)
    
    // Attach annotations to entities
    // LEARNING: Group annotations by blockInstanceId and attach to entities
    // WHY: Consistent pattern with relationships - annotations attached during hydration
    // PATTERN: Group annotations, then attach to entities (future-proof for other entity types)
    const annotationsByEntity = groupAnnotationsByEntity(
      staged.fetchedAnnotations,
      staged.fetchedAnnotationAssignments
    )
    
    // Attach annotations to blockInstance entities
    // LEARNING: Type assertion needed because entities are typed as union
    // WHY: TypeScript can't infer specific entity types from GlobalData.entities
    // PATTERN: Assert to specific entity type when we know the entityKey
    // LEARNING: Use map to create new entities instead of mutating in place
    const blockInstances = entities.blockInstance || []
    const entitiesWithAnnotations = {
      ...entities,
      blockInstance: blockInstances.map(blockInstance => {
      const annotations = annotationsByEntity.get(blockInstance.id)
      // Type assertion: we know this is blockInstance, so it's BlockInstanceEntity
      const blockInstanceEntity = blockInstance as BlockInstanceEntity
      if (annotations && annotations.length > 0) {
        return {
          ...blockInstanceEntity,
          annotations
        }
      } else {
        // No annotations, ensure empty array
        return {
          ...blockInstanceEntity,
          annotations: []
        }
      }
    })
    }
    
    // Transform all relationships (including components) to GlobalRelationship format
    const relationships = (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).reduce(
      (acc, relType) => {
        acc[relType] = transformApiRelationships(staged.fetchedRelationships, relType, entitiesWithAnnotations)
        return acc
      },
      {} as Record<GlobalRelationshipKey, GlobalRelationship[]>
    )
    
    return {
      entities: entitiesWithAnnotations,
      relationships,
      // NOTE: instanceComponents are now in relationships.instanceComponents
      // Session 1.4.6: Include annotations in globalData (configuration data)
      annotations: fetchedAnnotations,
      // Session 1.4.7: Include annotation types in globalData (configuration data)
      annotationTypes: fetchedAnnotationTypes,
      // NOTE: Metadata removed - use useMetadataCache() for admin metadata access
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
    // WHY: Need entity type to fetch correct metadata for boolean field detection
    // PATTERN: Extract entityKey from entity parameter (it's included in mutation calls)
    const entityKey = entity.entityKey
    if (!entityKey) {
      // LEARNING: Use Object.fromEntries to build result object functionally
      // WHY: Avoids object property mutations - builds object immutably
      // PATTERN: Filter entries, then build object from filtered entries
      const filteredEntries = Object.entries(entity)
        .filter(([frontendKey, value]) => frontendKey !== 'entityKey' && value !== undefined)
      return Object.fromEntries(filteredEntries)
    }

    // LEARNING: Get entity type for metadata lookup
    // WHY: Metadata is organized by entityType (blockShape, partShape, blockInstance, partInstance)
    // PATTERN: Use getEntityTypeForMetadata to map entityKey to entityType
    const entityType = getEntityTypeForMetadata(entityKey)
    if (!entityType) {
      // LEARNING: Use Object.fromEntries to build result object functionally
      // WHY: Avoids object property mutations - builds object immutably
      // PATTERN: Filter entries, then build object from filtered entries
      const filteredEntries = Object.entries(entity)
        .filter(([frontendKey, value]) => frontendKey !== 'entityKey' && value !== undefined)
      return Object.fromEntries(filteredEntries)
    }

    // LEARNING: Get metadata from cache to determine boolean fields dynamically
    // WHY: No hardcoded field lists - automatically includes all boolean fields from metadata
    // PATTERN: Use metadata cache to get field metadata for this entity type
    let metadataCache
    let metadata: Record<string, FieldMetadataEntry> = {}
    try {
      metadataCache = useMetadataCache()
      metadata = metadataCache.getMetadata(entityType)
    } catch (error) {
      // Continue without metadata - will skip boolean conversion
    }

    // LEARNING: Schema-based required boolean fields (database schema is source of truth)
    // WHY: Metadata may incorrectly mark fields as not required, but database schema requires them
    // PATTERN: Use database schema (from model definitions) to determine required fields, override metadata
    const SCHEMA_REQUIRED_BOOLEANS: Record<string, string[]> = {
      partInstance: ['active', 'onSite', 'clientPresent', 'moveable', 'zeroOutPart'],
      blockInstance: ['active', 'composite', 'differential', 'allowMultiple'],
      blockShape: ['composable', 'canHaveParts', 'isStateControl'],
      partShape: [],
    }
    const SCHEMA_NULLABLE_BOOLEANS: Record<string, string[]> = {
      partInstance: ['differentialOverride'],
      blockInstance: ['requiresUnitNumber'],
      blockShape: [],
      partShape: [],
    }
    // LEARNING: Schema-based required number fields (database schema is source of truth)
    // WHY: Metadata may incorrectly mark fields as not required, but database schema requires them
    // PATTERN: Use database schema to determine required number fields for empty string conversion
    const SCHEMA_REQUIRED_NUMBERS: Record<string, string[]> = {
      partInstance: ['baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime'],
      blockInstance: ['baseSqFt'],
      blockShape: [],
      partShape: [],
    }

    // LEARNING: Build maps of boolean and number fields by nullable status
    // WHY: Need to know which fields are nullable vs non-nullable to convert empty strings correctly
    // PATTERN: Use schema as source of truth, override metadata when they conflict
    
    // LEARNING: Start with schema-based classification (database schema is source of truth)
    // WHY: Metadata may be incorrect, but database schema is authoritative
    const schemaRequiredBooleans = SCHEMA_REQUIRED_BOOLEANS[entityType] || []
    const schemaNullableBooleans = SCHEMA_NULLABLE_BOOLEANS[entityType] || []
    const schemaRequiredNumbers = SCHEMA_REQUIRED_NUMBERS[entityType] || []

    // LEARNING: Build Sets from schema arrays functionally
    // WHY: Avoids Set mutations (add) - builds Sets immutably using Set constructor
    // PATTERN: Use Set constructor with arrays to build Sets functionally
    const schemaNonNullableBooleansSet = new Set(schemaRequiredBooleans)
    const schemaNullableBooleansSet = new Set(schemaNullableBooleans)
    const schemaRequiredNumbersSet = new Set(schemaRequiredNumbers)

    // LEARNING: Process metadata using reduce to build Sets functionally
    // WHY: Avoids Set mutations (add) - builds Sets immutably
    // PATTERN: Reduce metadata entries to arrays, then build Sets from arrays
    const metadataRequiredFields = Object.entries(metadata)
      .filter(([, fieldMetadata]) => fieldMetadata.isRequired)
      .map(([fieldKey]) => fieldKey)

    const metadataBooleanFields = Object.entries(metadata)
      .filter(([fieldKey, fieldMetadata]) => 
        fieldMetadata.dataType === 'boolean' &&
        !schemaNonNullableBooleansSet.has(fieldKey) &&
        !schemaNullableBooleansSet.has(fieldKey)
      )
      .reduce((acc, [fieldKey, fieldMetadata]) => {
        if (fieldMetadata.isRequired) {
          acc.nonNullable.push(fieldKey)
        } else {
          acc.nullable.push(fieldKey)
        }
        return acc
      }, { nonNullable: [] as string[], nullable: [] as string[] })

    const metadataRequiredNumbers = Object.entries(metadata)
      .filter(([fieldKey, fieldMetadata]) =>
        fieldMetadata.dataType === 'number' &&
        fieldMetadata.isRequired &&
        !schemaRequiredNumbersSet.has(fieldKey)
      )
      .map(([fieldKey]) => fieldKey)

    // LEARNING: Build final Sets by combining schema and metadata arrays functionally
    // WHY: Combine all sources into final Sets using Set constructor - no mutations
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
        // LEARNING: Ensure required fields are included even if undefined
        // WHY: Database requires NOT NULL fields to have values, so we must provide defaults
        // PATTERN: For required fields, use appropriate default based on dataType
        if (requiredFields.has(frontendKey)) {
          const fieldMetadata = metadata[frontendKey]
          if (fieldMetadata) {
            if (fieldMetadata.dataType === 'boolean') {
              return [frontendKey, false] // Required booleans default to false
            } else if (fieldMetadata.dataType === 'number') {
              return [frontendKey, 0] // Required numbers default to 0
            } else if (fieldMetadata.dataType === 'string') {
              return [frontendKey, ''] // Required strings default to empty string
            }
            // Skip other types - they should be handled elsewhere
          }
        }
        return null // Skip undefined values for non-required fields
      }
      
      // LEARNING: Convert empty strings to proper values for boolean and number fields
      // WHY: Forms may send empty strings for unchecked/empty fields, but PostgreSQL requires actual types
      // PATTERN: Check if field is boolean or number and convert empty string appropriately
      if (value === '') {
        if (nullableBooleanFields.has(frontendKey) || nonNullableBooleanFields.has(frontendKey)) {
          // Convert empty string to null for nullable booleans, false for non-nullable booleans
          const convertedValue = nullableBooleanFields.has(frontendKey) ? null : false
          return [frontendKey, convertedValue]
        } else if (requiredNumberFields.has(frontendKey)) {
          // Convert empty string to 0 for required number fields
          return [frontendKey, 0]
        } else {
          // Keep empty string for other field types
          return [frontendKey, value]
        }
      } else {
        // Keep camelCase - Sequelize automatically converts to snake_case for database columns
        return [frontendKey, value]
      }
    }

    // LEARNING: Use Object.fromEntries + map to build result object functionally
    // WHY: Avoids object property mutations - builds object immutably
    // PATTERN: Map entries to transformed entries, filter nulls, build object
    const transformedEntries = Object.entries(entity)
      .map(transformField)
      .filter((entry): entry is [string, unknown] => entry !== null)
    
    return Object.fromEntries(transformedEntries)
  }
}

// Export singleton
export const globalTransformer = new GlobalTransformer()

