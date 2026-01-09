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
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity, GlobalEntityId } from '@/types/entities'
import { AdminEntity } from '@/types/admin/AdminEntity'
import { getAdminConfig } from '@/configs/adminConfig'
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
  validConstituents?: GlobalEntityId[]
  bookingCascades?: GlobalEntityId[]
  activeConstituents?: GlobalEntityId[]
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
      partInstance: []
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
    
    // Get field names from formFieldConfig instead of displayConfig
    const adminConfig = getAdminConfig()
    const formFieldConfig = adminConfig?.formFieldConfig?.[entityKey] || {}
    const fieldNames = Object.keys(formFieldConfig) as GlobalFieldKey<GE>[]
    
    // Validate fields using AdminEntity methods
    // Ensure all fields from formFieldConfig exist
    fieldNames.forEach(fieldKey => {
      if (!adminEntity.hasField(fieldKey)) {
        // Field doesn't exist - get valid value (with default fallback)
        const validValue = adminEntity.getValidAdminValue(fieldKey)
        adminEntity.setField(fieldKey, validValue)
      }
    })
    
    // LEARNING: Preserve all original entity properties, not just formFieldConfig properties
    // WHY: Tests expect all entity properties (name, orderIndex, baseTime, baseFee, etc.) to be preserved
    // PATTERN: Start with original entity, merge validated properties from AdminEntity, then add relationships
    const plainObjectFromConfig = adminEntity.toPlainObject(formFieldConfig)
    
    // LEARNING: Merge original entity properties with validated properties from AdminEntity
    // WHY: Ensures all original properties are preserved, while validated properties override defaults
    // PATTERN: Start with original entity, then merge validated properties
    const plainObject = {
      ...entityWithKey,
      ...plainObjectFromConfig,
    } as AdminObject<GE>
    
    // LEARNING: Ensure relationships are included even if not in formFieldConfig
    // WHY: Relationships (validCascades, validConstituents, etc.) are attached as properties but may not be in formFieldConfig
    // PATTERN: Explicitly include relationship arrays if they exist on the entity
    //          Use type-safe property access - check if property exists before accessing
    const relationshipKeys = ['validCascades', 'validConstituents', 'bookingCascades', 'activeConstituents', 'instanceComponents'] as const
    relationshipKeys.forEach(relKey => {
      // LEARNING: Type-safe property access - check if property exists before accessing
      // WHY: entityWithKey is typed as GlobalEntity<GE> but has AdminObject<GE> properties after attachRelationshipData
      // PATTERN: Use hasOwnProperty check, then access with typed key
      if (Object.prototype.hasOwnProperty.call(entityWithKey, relKey)) {
        // Type assertion is safe here because we've verified the property exists
        // and we know it's one of the relationship properties from AdminObject
        const relationshipValue = (entityWithKey as AdminObject<GE>)[relKey]
        if (relationshipValue !== undefined) {
          (plainObject as AdminObject<GE>)[relKey] = relationshipValue
        }
      }
    })
    
    // Return as AdminObject (GlobalEntity + relationships)
    return plainObject as AdminObject<GE>
  }

  /**
   * Attach relationship data to entity
   * LEARNING: Extracts child IDs from GlobalRelationship[] and attaches as arrays
   * WHY: Select fields need relationship arrays (validCascades, validConstituents, bookingCascades, activeConstituents) attached
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
      validConstituents: 'validConstituents', 
      bookingCascades: 'bookingCascades',
      activeConstituents: 'activeConstituents',
      instanceComponents: 'instanceComponents'
    }

    // Process each relationship type using functional approach
    Object.entries(relationshipMappings).forEach(([relType, propName]) => {
      // LEARNING: Always initialize to empty array for consistency
      // WHY: Makes it clear that the property exists but has no relationships
      // PATTERN: Initialize first, then populate if relationships exist
      (entity as Partial<GlobalEntity<GE>>)[propName as keyof GlobalEntity<GE>] = [] as unknown as GlobalEntity<GE>[keyof GlobalEntity<GE>]
      
      const relationships = globalRelationships[relType]
      if (!relationships || !Array.isArray(relationships)) return

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

        // Attach child IDs to the entity (replace empty array)
        // LEARNING: Use Partial<GlobalEntity<GE>> for type-safe property access
        // WHY: Entity is being mutated to include relationship arrays, so Partial allows optional properties
        if (childIds.length > 0) {
          (entity as Partial<GlobalEntity<GE>>)[propName as keyof GlobalEntity<GE>] = childIds as unknown as GlobalEntity<GE>[keyof GlobalEntity<GE>]
        }
      }
    })
  }

}

// Export singleton
export const adminTransformer = new AdminTransformer()
