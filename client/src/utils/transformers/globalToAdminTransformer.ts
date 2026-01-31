/**
 * Global to Admin Transformer
 * 
 * LEARNING: Transforms GlobalData to AdminObject format
 * WHY: Validates entities, attaches relationships, and ensures data integrity for admin interface
 * PATTERN: Uses AdminEntity temporarily for validation, then converts to plain objects for Vue reactivity
 * COMPARISON: React outputs AdminEntity class instances. Vue outputs AdminObject (plain objects with relationships + validated properties)
 */

import type { GlobalData, GlobalRelationship } from './fetchToGlobalTransformer'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity, GlobalEntityId } from '@/types/entities'
import { AdminEntity } from '@/types/admin/AdminEntity'
import { findRelationshipsByParent, extractChildIds } from './relationshipTransformers'
/**
 * AdminObject type - Enhanced GlobalEntity with relationships and validated properties
 * LEARNING: This represents admin-enhanced entities, not just GlobalEntity
 * WHY: Admin interface needs entities with relationship arrays attached and validated properties
 * PATTERN: GlobalEntity + relationships + validated properties
 */
export type AdminObject<GE extends GlobalEntityKey> = GlobalEntity<GE> & {
  // Relationship arrays attached during transformation
  validCascades?: GlobalEntityId[]
  validParts?: GlobalEntityId[]
  validEvents?: GlobalEntityId[]
  bookingCascades?: GlobalEntityId[]
  partAssignments?: GlobalEntityId[]
  annotationAssignments?: GlobalEntityId[]
  eventAssignments?: GlobalEntityId[]
  instanceComponents?: GlobalEntityId[]
}

/**
 * AdminObjectMap - Map of entity types to AdminObject arrays
 */
export type AdminObjectMap = {
  [GE in GlobalEntityKey]: AdminObject<GE>[]
}

/**
 * Admin Transformer Class
 * LEARNING: Transforms GlobalData to AdminObject format with validation
 * WHY: Provides validated, relationship-enhanced entities for admin interface
 * PATTERN: AdminEntity for validation → AdminObject for Vue reactivity
 */
export class AdminTransformer {
  /**
   * Transform GlobalData to AdminObjectMap
   * LEARNING: Validates entities, attaches relationships, and ensures data integrity
   * WHY: Admin interface needs entities with relationships attached and validated properties
   * PATTERN: Transform each entity type using AdminEntity validation layer
   * 
   * @param globalData - GlobalData with entities and relationships
   * @returns AdminObjectMap with validated entities and relationships attached
   */
  transformGlobalToAdmin(globalData: GlobalData): AdminObjectMap {
    const adminObjectMap: AdminObjectMap = {
      blockShape: [],
      blockInstance: [],
      partShape: [],
      partInstance: [],
      eventShape: [],
      eventInstance: [],
      annotationShape: [],
      annotationInstance: []
    }

    // Extract entity map and relationships from GlobalData
    const globalEntityMap = globalData.entities
    const globalRelationships = globalData.relationships

    // Transform each entity type using functional approach
    const transformed = Object.fromEntries(
        (Object.keys(globalEntityMap) as GlobalEntityKey[]).map(entityKey => {
          const globalEntities = globalEntityMap[entityKey]
        
        const transformedEntities = globalEntities.map(globalEntity => {
          return this.transformSingleEntity(globalEntity, entityKey, globalRelationships)
        }) as AdminObject<typeof entityKey>[]
        
        return [entityKey, transformedEntities]
      })
    )
    
    Object.assign(adminObjectMap, transformed)

    return adminObjectMap
  }

  /**
   * Transform a single GlobalEntity to AdminObject
   * LEARNING: Uses AdminEntity temporarily for validation, then converts to plain object
   * WHY: Validates data structure and ensures all properties exist with defaults
   * PATTERN: Attach relationships → Create AdminEntity with empty display config → Validate → Convert to plain object
   * 
   * @param globalEntity - GlobalEntity to transform
   * @param entityKey - Entity type key
   * @param globalRelationships - GlobalRelationship map for attaching relationships
   * @returns AdminObject (plain object with relationships + validated properties)
   */
  private transformSingleEntity<GE extends GlobalEntityKey>(
    globalEntity: GlobalEntity<GE>,
    entityKey: GE,
    globalRelationships?: Record<string, GlobalRelationship[]>
  ): AdminObject<GE> {
    // Add entityKey to the global entity since server doesn't provide it
    const entityWithKey = {
      ...globalEntity,
      entityKey: entityKey
    } as GlobalEntity<GE>
    
    // Attach relationship data if available
    if (globalRelationships) {
      this.attachRelationshipData(entityWithKey, entityKey, globalRelationships)
    }
    
    // Create AdminEntity instance with empty display config (not used for validation anymore)
    // AdminEntity still needs displayConfig parameter for constructor compatibility
    // Use type assertion since we're not using displayConfig for validation
    const emptyDisplayConfig = { primitives: {}, relationships: {}, layout: {} } as AdminEntity<GE>['displayConfig']
    const adminEntity = new AdminEntity(entityWithKey, emptyDisplayConfig)
    
    // LEARNING: Field validation removed - metadata-driven approach
    // WHY: formFieldConfig has been deprecated, metadata is the single source of truth
    // PATTERN: Trust entity data from server, no client-side field validation needed
    // NOTE: Field metadata from /admin-input-metadata API controls what fields are visible/editable
    
    // LEARNING: Preserve all original entity properties
    // WHY: Tests expect all entity properties (name, orderIndex, baseTime, baseFee, etc.) to be preserved
    // PATTERN: Use all entity properties, no field filtering
    const plainObjectFromConfig = adminEntity.toPlainObject({})
    
    // LEARNING: Merge original entity properties with validated properties from AdminEntity
    // WHY: Ensures all original properties are preserved, while validated properties override defaults
    // PATTERN: Start with original entity, then merge validated properties
    const plainObject = {
      ...entityWithKey,
      ...plainObjectFromConfig,
    } as AdminObject<GE>
    
    // LEARNING: Ensure relationships are included even if not in formFieldConfig
    // WHY: Relationships (validCascades, validParts, etc.) are attached as properties but may not be in formFieldConfig
    // PATTERN: Use reduce to build relationship object without mutations
    //          Use type-safe property access - check if property exists before accessing
    // LEARNING: Handle 'attendees' separately because it only exists on EventShapeEntity
    // WHY: 'attendees' is not on all entity types, so we need a type guard before accessing
    // PATTERN: Check entityKey before accessing entity-specific properties
    const relationshipKeys = ['validCascades', 'validParts', 'validEvents', 'bookingCascades', 'partAssignments', 'annotationAssignments', 'eventAssignments', 'instanceComponents'] as const
    const relationshipData = relationshipKeys.reduce((acc, relKey) => {
      // LEARNING: Type-safe property access - check if property exists before accessing
      // WHY: entityWithKey is typed as GlobalEntity<GE> but has AdminObject<GE> properties after attachRelationshipData
      // PATTERN: Use hasOwnProperty check, then access with typed key
      if (Object.prototype.hasOwnProperty.call(entityWithKey, relKey)) {
        // Type assertion is safe here because we've verified the property exists
        // and we know it's one of the relationship properties from AdminObject
        const relationshipValue = (entityWithKey as AdminObject<GE>)[relKey]
        if (relationshipValue !== undefined) {
          // LEARNING: Type assertion needed because TypeScript can't narrow relKey to specific relationship property
          // WHY: relKey is a string literal from array, but TypeScript sees acc[relKey] as intersection type
          // PATTERN: Assert the assignment is valid since we've verified relKey is a relationship key
          ;(acc as Record<string, unknown>)[relKey] = relationshipValue
        }
      }
      return acc
    }, {} as Partial<AdminObject<GE>>)
    
    // LEARNING: Handle 'attendees' property separately for EventShapeEntity
    // WHY: 'attendees' only exists on EventShapeEntity, not all entity types
    // PATTERN: Type guard to check entityKey before accessing entity-specific property
    if (entityKey === 'eventShape' && Object.prototype.hasOwnProperty.call(entityWithKey, 'attendees')) {
      const eventShapeEntity = entityWithKey as AdminObject<'eventShape'>
      if (eventShapeEntity.attendees !== undefined) {
        // LEARNING: Type assertion needed because relationshipData is Partial<AdminObject<GE>>
        // WHY: TypeScript can't narrow GE to 'eventShape' in the reduce context
        // PATTERN: Assert the assignment is valid since we've verified entityKey is 'eventShape'
        ;(relationshipData as Record<string, unknown>).attendees = eventShapeEntity.attendees
      }
    }
    
    // LEARNING: Merge relationship data into plainObject
    // WHY: Spread relationship data into plainObject to include relationships
    // PATTERN: Object.assign or spread to merge relationship properties
    Object.assign(plainObject, relationshipData)
    
    // Return as AdminObject (GlobalEntity + relationships)
    return plainObject as AdminObject<GE>
  }

  /**
   * Attach relationship data to entity
   * LEARNING: Extracts child IDs from GlobalRelationship[] and attaches as arrays
   * WHY: Select fields need relationship arrays (validCascades, validParts, bookingCascades, partAssignments) attached
   * PATTERN: Find relationships where entity is parent → Extract child IDs → Attach as array property
   * 
   * LEARNING: Always initializes relationship arrays (even if empty) for consistency
   * WHY: Makes it easier to distinguish between "not attached" (bug) vs "empty" (expected)
   * PATTERN: Initialize to empty array, then populate if relationships exist
   * 
   * @param entity - Entity to attach relationships to
   * @param entityKey - Entity type key
   * @param globalRelationships - GlobalRelationship map
   */
  private attachRelationshipData<GE extends GlobalEntityKey>(
    entity: GlobalEntity<GE>,
    _entityKey: GE,
    globalRelationships: Record<string, GlobalRelationship[]>
  ): void {
    // Map relationship types to entity properties
    const relationshipMappings = {
      validCascades: 'validCascades',
      validParts: 'validParts',
      validEvents: 'validEvents',
      bookingCascades: 'bookingCascades',
      partAssignments: 'partAssignments',
      annotationAssignments: 'annotationAssignments',
      eventAssignments: 'eventAssignments',
      attendeeAssignments: 'attendees', // Attendees are attached as 'attendees' property on EventShapeEntity
      instanceComponents: 'instanceComponents'
    }

    // LEARNING: Use reduce to build relationship data object without mutations
    // WHY: Functional approach - build object first, then assign all at once
    // PATTERN: Reduce to transform relationshipMappings into relationship data object
    const relationshipData = Object.entries(relationshipMappings).reduce((acc, [relType, propName]) => {
      // LEARNING: Always initialize to empty array for consistency
      // WHY: Makes it clear that the property exists but has no relationships
      // PATTERN: Initialize first, then populate if relationships exist
      let relationshipValue: GlobalEntityId[] = []
      
      const relationships = globalRelationships[relType]
      if (relationships && Array.isArray(relationships)) {
        // Find relationships where this entity is the parent
        // LEARNING: Use shared utility for relationship finding
        // WHY: DRY principle - consistent relationship finding across transformers
        // PATTERN: Use findRelationshipsByParent() instead of manual filter()
        const parentRelationships = findRelationshipsByParent(entity.id, relationships)

        if (parentRelationships.length > 0) {
          // Extract child IDs from all matching relationships
          // LEARNING: Use shared utility for child ID extraction
          // WHY: DRY principle - consistent child ID extraction across transformers
          // PATTERN: Use extractChildIds() instead of manual flatMap()
          const childIds = extractChildIds(parentRelationships)

          // Use child IDs if available
          if (childIds.length > 0) {
            relationshipValue = childIds
          }
        }
      }
      
      // LEARNING: Build relationship data object
      // WHY: Accumulate relationship properties in reduce
      // PATTERN: Assign relationship value to accumulator
      acc[propName as keyof GlobalEntity<GE>] = relationshipValue as unknown as GlobalEntity<GE>[keyof GlobalEntity<GE>]
      return acc
    }, {} as Partial<GlobalEntity<GE>>)
    
    // LEARNING: Merge relationship data into entity
    // WHY: Assign all relationship properties at once instead of mutating in loop
    // PATTERN: Object.assign to merge relationship data
    Object.assign(entity, relationshipData)
  }

}

// Export singleton
export const adminTransformer = new AdminTransformer()
