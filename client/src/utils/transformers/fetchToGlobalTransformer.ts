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
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { transformApiAnnotation, groupAnnotationsByEntity } from './annotationTransformers'

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
 */
export type GlobalData = {
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
  // NOTE: instanceComponents are now stored in relationships.instanceComponents as GlobalRelationship[]
  // Session 1.4.6: Annotations added to globalData cache (configuration data)
  annotations?: Annotation[]
  // Session 1.4.7: AnnotationTypes added to globalData cache (configuration data)
  annotationTypes?: AnnotationType[]
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
      // NOTE: All 6 relationship types (validCascades, validConstituents, dependentInstanceOptions, bookingCascades, activeConstituents, instanceComponents) fetched in parallel
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
      
      return {
        fetchedEntities,
        fetchedRelationships,
        fetchedAnnotations,
        fetchedAnnotationTypes,
        fetchedAnnotationAssignments
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
        fetchedAnnotationAssignments: []
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
        // LEARNING: Select default description for backward compatibility
        // WHY: Existing code expects description string property
        // PATTERN: Prioritize default, then generic, then first annotation
        const defaultAnnotation = annotations.find(ann => ann.isDefault === true)
        const selectedAnnotation = defaultAnnotation 
          ?? annotations.find(ann => ann.userTypeBlock === null)
          ?? annotations[0]
        
        return {
          ...blockInstanceEntity,
          annotations,
          description: selectedAnnotation?.text || ''
        }
      } else {
        // No annotations, ensure empty array and empty description
        return {
          ...blockInstanceEntity,
          annotations: [],
          description: ''
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
    }
  }

  /**
   * Dehydrate entity: Transform frontend field names to backend field names
   * LEARNING: All models now use underscored: true with camelCase properties
   * WHY: Sequelize expects camelCase properties and automatically converts to snake_case columns
   * PATTERN: Return entity as-is with camelCase - Sequelize handles conversion internally
   * 
   * @param entity - Entity with frontend field names (camelCase)
   * @returns Entity with camelCase properties (Sequelize converts to snake_case internally)
   */
  dehydrateEntity<GE extends GlobalEntityKey>(
    entity: Partial<GlobalEntity<GE>>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    // Transform fields - keep camelCase, Sequelize handles conversion
    for (const [frontendKey, value] of Object.entries(entity)) {
      if (frontendKey === 'entityKey') continue // Skip entityKey, backend doesn't need it
      if (value === undefined) continue // Skip undefined values
      
      // Keep camelCase - Sequelize automatically converts to snake_case for database columns
      result[frontendKey] = value
    }

    return result
  }
}

// Export singleton
export const globalTransformer = new GlobalTransformer()

