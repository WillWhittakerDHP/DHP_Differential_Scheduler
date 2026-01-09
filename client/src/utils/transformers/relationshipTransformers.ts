/**
 * Relationship Transformers
 * 
 * LEARNING: Common utilities for relationship transformation and component operations
 * WHY: DRY principle - shared logic for all relationship operations
 * PATTERN: Utility functions for relationship finding, filtering, and component operations
 * 
 * ARCHITECTURAL NOTE: Components are part of relationship transformation
 * because components are a relationship type. This integrates component logic
 * with relationship handling for consistency.
 */

import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'
import type { FetchedRelationship } from '@/types/relationships'
import type { ComponentStrategy } from '@/types/component'
import { DEFAULT_COMPONENT_RULES } from '@/constants/component'
import { RELATIONSHIP_KEYS, GlobalRelationshipKey } from '@/constants/relationships'
import { GlobalEntityKey } from '@/constants/entities'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { composePropertiesFromComponents } from './composePropertyValue'

/**
 * Transform FetchedRelationship[] to GlobalRelationship[] format
 * LEARNING: Groups flat relationships by parent and creates nested structure
 * WHY: Converts API response format to frontend format expected by transformers
 * PATTERN: Transform API relationships to GlobalRelationship format with parent/children structure
 * 
 * @param fetchedRelationships - Array of FetchedRelationship objects from API
 * @param relationshipKey - Relationship type key
 * @param entities - Map of entities by type for lookup
 * @returns Array of GlobalRelationship objects
 */
export function transformApiRelationships(
  fetchedRelationships: FetchedRelationship[],
  relationshipKey: GlobalRelationshipKey,
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
): GlobalRelationship[] {
  const config = RELATIONSHIP_KEYS[relationshipKey]
  if (!config) return []
  
  // LEARNING: Filter relationships by kind FIRST to avoid processing wrong relationship types
  // WHY: fetchedRelationships contains ALL relationship types mixed together from the API
  //      Without filtering, we'd try to resolve child_ids from wrong relationship types
  //      (e.g., validConstituents child_ids would be looked up in blockShape instead of partShape)
  // PATTERN: Filter by kind before processing to ensure we only process the correct relationship type
  const filteredRelationships = fetchedRelationships.filter(
    rel => rel.kind === relationshipKey
  )
  
  // Group relationships by parent_id
  // LEARNING: Use reduce to build Map instead of forEach with Map.set mutations
  // WHY: Functional approach avoids forEach with Map mutations
  const parentMap = filteredRelationships
    .filter(rel => !rel.disabled)
    .reduce((map, rel) => {
      const existing = map.get(rel.parent_id) || []
      map.set(rel.parent_id, [...existing, rel.child_id])
      return map
    }, new Map<string, string[]>())
  
  // Transform to GlobalRelationship format
  // LEARNING: Use map/flatMap to build array instead of forEach with push mutations
  // WHY: Functional approach avoids forEach with array mutations
  const globalRelationships: GlobalRelationship[] = Array.from(parentMap.entries())
    .map(([parentId, childIds]) => {
      // Find parent entity
      const parentEntity = findById(entities[config.parentEntity] || [], parentId)
      if (!parentEntity) {
        return null
      }
      
      // Find child entities
      const { resolved: childEntities } = resolveByIds(entities[config.childEntity] || [], childIds)
      
      if (childEntities.length > 0) {
        return {
          relationshipKind: relationshipKey,
          parent: parentEntity,
          children: childEntities,
        }
      }
      
      return null
    })
    .filter((rel): rel is GlobalRelationship => rel !== null)
  
  return globalRelationships
}

/**
 * Find relationships where entity is parent
 * 
 * LEARNING: Common pattern for finding relationships by parent ID
 * WHY: Used across multiple transformers (admin, scheduler)
 * PATTERN: Filter relationships where parent.id matches
 * 
 * @param parentId - Parent entity ID
 * @param relationships - Array of GlobalRelationship objects
 * @returns Array of relationships where entity is parent
 */
export function findRelationshipsByParent(
  parentId: string,
  relationships: GlobalRelationship[]
): GlobalRelationship[] {
  return relationships.filter(
    rel => rel.parent && rel.parent.id === parentId
  )
}

/**
 * Group flat relationships by parent_id
 * 
 * LEARNING: Transforms flat relationship array into grouped structure
 * WHY: Used in fetchToGlobalTransformer to group relationships by parent
 * PATTERN: Map parent_id -> child_id[]
 * 
 * Overload 1: FetchedRelationship[] (API format)
 * @param relationships - Array of FetchedRelationship objects
 * @returns Map of parent_id to child_id arrays
 * 
 * Overload 2: GlobalRelationship[] (transformed format)
 * @param relationships - Array of GlobalRelationship objects
 * @returns Map of parent_id to GlobalRelationship arrays
 */
export function groupRelationshipsByParent(
  relationships: FetchedRelationship[]
): Map<string, string[]>
export function groupRelationshipsByParent(
  relationships: GlobalRelationship[]
): Map<string, GlobalRelationship[]>
export function groupRelationshipsByParent(
  relationships: FetchedRelationship[] | GlobalRelationship[]
): Map<string, string[]> | Map<string, GlobalRelationship[]> {
  // LEARNING: Detect which type of relationship array we have
  // WHY: Tests pass GlobalRelationship[], production uses FetchedRelationship[]
  // PATTERN: Check for parent_id property (FetchedRelationship) vs parent property (GlobalRelationship)
  if (relationships.length > 0 && 'parent_id' in relationships[0]) {
    // FetchedRelationship[] path
    const fetchedRels = relationships as FetchedRelationship[]
    const parentMap = new Map<string, string[]>()
    
    fetchedRels.forEach(rel => {
      if (rel.disabled) return
      const existing = parentMap.get(rel.parent_id) || []
      parentMap.set(rel.parent_id, [...existing, rel.child_id])
    })
    
    return parentMap
  } else {
    // GlobalRelationship[] path
    const globalRels = relationships as GlobalRelationship[]
    const parentMap = new Map<string, GlobalRelationship[]>()
    
    globalRels.forEach(rel => {
      if (!rel.parent) return
      const existing = parentMap.get(rel.parent.id) || []
      parentMap.set(rel.parent.id, [...existing, rel])
    })
    
    return parentMap
  }
}

/**
 * Extract child IDs from relationships
 * 
 * LEARNING: Common pattern for extracting child entity IDs
 * WHY: Used in admin transformer to attach relationship arrays
 * PATTERN: Flat map children arrays to extract IDs
 * 
 * @param relationships - Array of GlobalRelationship objects
 * @returns Array of child entity IDs
 */
export function extractChildIds(relationships: GlobalRelationship[]): string[] {
  return relationships.flatMap(rel => 
    rel.children ? rel.children.map(child => child.id) : []
  )
}

/**
 * Filter relationships by relationship kind
 * 
 * LEARNING: Filter relationships by type
 * WHY: Used to get specific relationship types from GlobalData
 * PATTERN: Simple filter by relationshipKind
 * 
 * @param relationships - Array of GlobalRelationship objects
 * @param relationshipKind - Relationship type to filter by
 * @returns Filtered relationships
 */
export function filterRelationshipsByKind(
  relationships: GlobalRelationship[],
  relationshipKind: GlobalRelationshipKey
): GlobalRelationship[] {
  return relationships.filter(rel => rel.relationshipKind === relationshipKind)
}

/**
 * WHY: Components are a relationship type, so component logic belongs here
 * PATTERN: These functions work with GlobalRelationship[] instead of ActiveComponent[]
 */
export function getComponentsRecursive(
  composerId: string,
  entityKind: GlobalEntityKey,
  relationships: GlobalRelationship[],
  visited: Set<string> = new Set()
): string[] {
  if (visited.has(composerId)) {
    return [] // Circular reference detected, return empty
  }
  
  visited.add(composerId)
  
  // Find relationships where this composer is parent
  const composerRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.id === composerId &&
           rel.parent.entityKey === entityKind
  )
  
  // Get direct component IDs
  const directComponents = composerRelationships.flatMap(rel =>
    rel.children.map(child => child.id)
  )
  
  // Get recursive components (components that are themselves composers)
  const recursiveComponents: string[] = []
  for (const componentId of directComponents) {
    // Check if this component is itself a composer
    const isComponentAlsoComposer = relationships.some(
      rel => rel.relationshipKind === 'instanceComponents' &&
             rel.parent.id === componentId &&
             rel.parent.entityKey === entityKind
    )
    
    if (isComponentAlsoComposer) {
      // Recursively get components of this component
      const nestedComponents = getComponentsRecursive(componentId, entityKind, relationships, visited)
      recursiveComponents.push(...nestedComponents)
    } else {
      // Direct component, not a composer
      recursiveComponents.push(componentId)
    }
  }
  
  return recursiveComponents
}


/**
 * Compose properties from components using relationships
 * 
 * LEARNING: Computed view pattern - always recalculate from components
 * WHY: Ensures data consistency, no stored composed values
 * PATTERN: Property-specific component based on config rules (component strategies combine properties)
 * 
 * ARCHITECTURAL CHANGE: Now works with GlobalRelationship[] instead of ActiveComponent[]
 * 
 * @param composerId - Composer entity ID
 * @param entityKind - Entity type key
 * @param relationships - GlobalRelationship[] for instanceComponents
 * @param entities - Entity map from GlobalData
 * @param componentRules - Component strategy rules per property
 * @returns Partial entity with composed properties
 */
export function composePropertiesFromRelationships<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  componentRules: Record<string, ComponentStrategy> = DEFAULT_COMPONENT_RULES
): Partial<GlobalEntity<GE>> {
  // Filter to instanceComponents relationships for this entity kind
  const componentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.entityKey === entityKind
  )
  
  // Get all components (recursive to handle hierarchical component relationships)
    const componentIds = getComponentsRecursive(composerId, entityKind, componentRelationships)
  
  if (componentIds.length === 0) {
    return {}
  }
  
  // Get component entities
  const { resolved: components } = resolveByIds(entities[entityKind] || [], componentIds)
  
  if (components.length === 0) {
    return {}
  }
  
  // Compose properties using shared utility
  const composed = composePropertiesFromComponents(
    components,
    entityKind,
    componentRules,
    entities.blockShape
  )
  
  return composed as Partial<GlobalEntity<GE>>
}

/**
 * Get composed entity from relationships
 * 
 * LEARNING: Creates computed view of composer from components
 * WHY: Composers are computed views, not stored entities
 * PATTERN: Merge composer base properties with composed component properties
 * 
 * ARCHITECTURAL CHANGE: Now works with GlobalRelationship[] instead of ActiveComponent[]
 * 
 * @param composerId - Composer entity ID
 * @param entityKind - Entity type key
 * @param relationships - GlobalRelationship[] for instanceComponents
 * @param entities - Entity map from GlobalData
 * @param componentRules - Component strategy rules per property
 * @returns Composed entity or null if not found
 */
export function getComposedEntityFromRelationships<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>,
  componentRules: Record<string, ComponentStrategy> = DEFAULT_COMPONENT_RULES
): GlobalEntity<GE> | null {
  // Get composer entity (base properties)
  const composerEntity = findById(entities[entityKind] || [], composerId)
  if (!composerEntity) {
    
    return null
  }
  
  // LEARNING: Type assertion needed because entities array is union type
  // WHY: TypeScript can't infer specific entity type from union type array
  // PATTERN: Assert to specific entity type when we know the entityKind
  const composer = composerEntity as GlobalEntity<GE>
  
  // Filter to instanceComponents relationships for this entity kind
  const componentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.entityKey === entityKind
  )
  
  // Compose properties from components
  const composed = composePropertiesFromRelationships(
    composerId,
    entityKind,
    componentRelationships,
    entities,
    componentRules
  )
  
  // Merge composer with composed properties
  // Composed properties override composer properties (computed view)
  const composedEntity: GlobalEntity<GE> = {
    ...composer,
    ...composed,
    isComposer: true,
    instanceComponents: getComponentsRecursive(
      composerId,
      entityKind,
      componentRelationships
    ),
  } as GlobalEntity<GE>
  
  return composedEntity
}

/**
 * Compose part instances from composed block instances
 * 
 * LEARNING: When composing block instances, compose all part instances from all composed blocks
 * WHY: Composer should show all part instances from all component blocks
 * PATTERN: Merge activeConstituents relationships from all composed blocks
 * 
 * ARCHITECTURAL CHANGE: Now works with GlobalRelationship[] instead of ActiveComponent[]
 * 
 * @param composedBlockIds - Array of composed block instance IDs
 * @param relationships - GlobalRelationship[] for activeConstituents
 * @returns Array of part instance IDs
 */
export function composePartInstances(
  composedBlockIds: string[],
  relationships: GlobalRelationship[]
): string[] {
  const allPartInstanceIds = new Set<string>()
  
  // Filter to activeConstituents relationships
  const constituentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'activeConstituents'
  )
  
  for (const blockId of composedBlockIds) {
    // Find relationships where this block is parent
    const blockRelationships = constituentRelationships.filter(
      rel => rel.parent.id === blockId
    )
    
    // Collect all part instance IDs from this block's activeConstituents
    blockRelationships.forEach(rel => {
      rel.children.forEach(partInstance => {
        allPartInstanceIds.add(partInstance.id)
      })
    })
  }
  
  return Array.from(allPartInstanceIds)
}

