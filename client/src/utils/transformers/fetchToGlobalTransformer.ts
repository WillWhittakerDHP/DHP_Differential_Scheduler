/**
 * Fetch to Global Transformer
 * 
 * LEARNING: Transforms API responses (snake_case) to GlobalData format (camelCase)
 * WHY: Converts backend database field names to frontend property names
 * PATTERN: Transformer class that handles entity and relationship transformation
 */

import apiClient, { getEntityEndpoint, getRelationshipEndpoint } from '../api'
import { ENTITY_KEYS } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity, GlobalEntityId } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { FetchedRelationship } from '@/types/relationships'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { transformApiEntity } from './entityTransformers'
import { transformApiRelationships } from './relationshipTransformers'
import { transformApiAnnotation } from './annotationTransformers'
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
  // NOTE: instanceComponents are now stored in relationships.instanceComponents as GlobalRelationship[]
  // NOTE: eventAssignments and annotationAssignments are now stored in relationships.eventAssignments and relationships.annotationAssignments
  // NOTE: Events and annotations are now core entities stored in entities section
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
  
  // LEARNING: Different relationship types use different field names
  // WHY: Some models use domain-specific field names (blockInstanceId, eventShapeId) instead of generic parent_id/child_id
  // PATTERN: Handle model-specific field names before falling back to standard parent_id/child_id
  let parentId: string | undefined
  let childId: string | undefined
  
  if (relationshipKey === 'annotationAssignments') {
    // annotationAssignments uses blockInstanceId/annotationId (model-specific field names)
    parentId = (raw.block_instance_id ?? raw.blockInstanceId ?? raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.annotation_id ?? raw.annotationId ?? raw.child_id ?? raw.childId) as string | undefined
  } else if (relationshipKey === 'attendeeAssignments') {
    // attendeeAssignments uses eventShapeId/userTypeBlockInstanceId (model-specific field names)
    parentId = (raw.event_shape_id ?? raw.eventShapeId ?? raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.user_type_block_instance_id ?? raw.userTypeBlockInstanceId ?? raw.child_id ?? raw.childId) as string | undefined
  } else {
    // Standard relationships use parent_id/child_id pattern
    parentId = (raw.parent_id ?? raw.parentId) as string | undefined
    childId = (raw.child_id ?? raw.childId) as string | undefined
  }
  
  // LEARNING: eventAssignments uses parent_kind enum to determine parent type dynamically
  // WHY: parent_id can reference either partInstance or blockInstance based on parent_kind
  // PATTERN: Use parent_kind from API response to override parentKind
  let parentKindOverride: GlobalEntityKey | undefined
  if (relationshipKey === 'eventAssignments' && raw.parent_kind) {
    parentKindOverride = raw.parent_kind as GlobalEntityKey
  }
  
  // LEARNING: Extract relationship-specific fields that are NOT metadata
  // WHY: Metadata (ternaryValue, orderIndex, isDefault) is now stored in shape tables, not relationship tables
  //      Only extract fields that are relationship-specific (like userTypeBlockBlockInstanceId for annotationAssignments,
  //      partShapeId/blockShapeId for eventAssignments to indicate which shape uses the event)
  // PATTERN: Relationships just indicate which shapes are active - metadata lives in shape tables
  const partShapeId = raw.partShapeId ?? raw.part_shape_id
  const blockShapeId = raw.blockShapeId ?? raw.block_shape_id
  const userTypeBlockBlockInstanceId = raw.userTypeBlockBlockInstanceId ?? raw.user_type_block_block_instance_id
  
  return {
    id: (raw.id ?? '') as GlobalEntityId,
    kind: relationshipKey,
    parent_kind: (parentKindOverride ?? parentKind) as GlobalEntityKey,
    child_kind: childKind as GlobalEntityKey,
    parent_id: (parentId ?? '') as GlobalEntityId,
    child_id: (childId ?? '') as GlobalEntityId,
    disabled: Boolean(raw.disabled ?? false),
    // LEARNING: Only include relationship-specific fields, not metadata
    // WHY: Metadata (ternaryValue, orderIndex, isDefault) is stored in shape tables
    //      Relationships just indicate which instances are active
    // NOTE: userTypeBlockBlockInstanceId is relationship-specific override for annotationAssignments
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
        // Special handling for annotationInstance: map "text" field to "name" for entity compatibility
        if (entityKey === 'annotationInstance') {
          const mappedEntities = normalizedEntities.map(entity => {
            const entityWithName = entity as unknown as Record<string, unknown>
            if (entityWithName.text && !entityWithName.name) {
              entityWithName.name = entityWithName.text
            }
            return entity
          })
          acc[entityKey] = mappedEntities as GlobalEntity<typeof entityKey>[]
        } else {
          acc[entityKey] = normalizedEntities
        }
        return acc
      }, {} as Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>)
      
      // LEARNING: Fetch all relationships in parallel using same processor pattern
      // WHY: Consistent parallel fetching pattern across all data types
      // PATTERN: map() → Promise.all() for parallel execution
      // NOTE: All relationship types (including eventAssignments and annotationAssignments) fetched in parallel
      const relationshipPromises = (Object.keys(RELATIONSHIP_KEYS) as GlobalRelationshipKey[]).map(async (relationshipKey) => {
        const endpoint = getRelationshipEndpoint(relationshipKey)
        const response = await apiClient.get<Record<string, unknown>[]>(endpoint)
        
        // Transform each relationship from API format to FetchedRelationship format
        // LEARNING: API endpoint already filters by relationship type, so response doesn't include 'kind'
        // WHY: Endpoint is /relationships/{relationshipKey}, so we pass relationshipKey to transformer
        // PATTERN: Transform raw API response to expected FetchedRelationship format using relationshipKey
        const transformed = response.data.map(raw => transformApiRelationship(raw, relationshipKey))
        
        return transformed
      })
      
      const relationshipResults = await Promise.all(relationshipPromises)
      const fetchedRelationships = relationshipResults.flat()
      
      // NOTE: Events and annotations are now fetched as entities via /entities/:entityType
      // They are included in fetchedEntities above
      
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
    
    // LEARNING: Annotations follow the same pattern as entities and relationships
    // WHY: Annotations are entities (AnnotationInstance, AnnotationShape), relationships are GlobalRelationship[]
    // PATTERN: No special attachment - annotations accessed via relationships.annotationAssignments like other relationships
    
    // Transform all relationships (including components) to GlobalRelationship format
    // LEARNING: Events and annotations are now in entities Record, so transformApiRelationships can resolve them from there
    // WHY: Events and annotations are now core entities stored in entities section
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
      // NOTE: Events and annotations are now in entities section
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

    // LEARNING: Build boolean fields arrays functionally using reduce
    // WHY: Avoids array mutations (push) - builds arrays immutably
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
            // LEARNING: Skip required reference fields if undefined - they must be provided by user
            // WHY: Reference fields (like eventShapeRef) have no sensible default - user must select a value
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
            // Skip other types - they should be handled elsewhere
          }
        }
        return null // Skip undefined values for non-required fields
      }
      
      // LEARNING: Handle null values for reference fields
      // WHY: For required reference fields, Sequelize needs to see null to validate properly
      //      For optional reference fields, we can skip null values
      // PATTERN: Check if field is required reference and send null, otherwise skip
      if (value === null) {
        const fieldMetadata = metadata[frontendKey]
        const isReferenceField = fieldMetadata?.dataType === 'reference' || 
                                 frontendKey.endsWith('Ref') || 
                                 frontendKey.endsWith('Id') ||
                                 frontendKey === 'id'
        
        if (isReferenceField) {
          // LEARNING: Send null for required reference fields so Sequelize can validate
          // WHY: Sequelize will return clear validation error if required field is null
          //      Skipping the field entirely might cause different behavior
          if (requiredFields.has(frontendKey)) {
            return [frontendKey, null] // Send null for required reference fields
          }
          // Skip null for optional reference fields
          return null
        }
      }
      
      // LEARNING: Convert empty strings to proper values for boolean, number, and reference/UUID fields
      // WHY: Forms may send empty strings for unchecked/empty fields, but PostgreSQL requires actual types
      //      UUID fields cannot accept empty strings - they must be valid UUIDs or null
      // PATTERN: Check if field is boolean, number, or reference and convert empty string appropriately
      if (value === '') {
        if (nullableBooleanFields.has(frontendKey) || nonNullableBooleanFields.has(frontendKey)) {
          // Convert empty string to null for nullable booleans, false for non-nullable booleans
          const convertedValue = nullableBooleanFields.has(frontendKey) ? null : false
          return [frontendKey, convertedValue]
        } else if (requiredNumberFields.has(frontendKey)) {
          // Convert empty string to 0 for required number fields
          return [frontendKey, 0]
        } else {
          // LEARNING: Check if field is a reference/UUID field (dataType: 'reference' or field name ends with 'Ref'/'Id')
          // WHY: UUID fields cannot accept empty strings - PostgreSQL will reject them
          // PATTERN: Convert empty strings to null for reference fields, let Sequelize handle required field validation
          const fieldMetadata = metadata[frontendKey]
          const isReferenceField = fieldMetadata?.dataType === 'reference' || 
                                   frontendKey.endsWith('Ref') || 
                                   frontendKey.endsWith('Id') ||
                                   frontendKey === 'id'
          
          if (isReferenceField && typeof value === 'string' && value === '') {
            // Convert empty string to null for UUID/reference fields
            // Sequelize will validate required fields and provide clear error if field is required
            return [frontendKey, null]
          }
          
          // Keep empty string for other field types (e.g., regular string fields)
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

