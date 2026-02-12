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
import { RELATIONSHIP_KEYS, GlobalRelationshipKey } from '@/constants/relationships'
import { GlobalEntityKey } from '@/constants/entities'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import { composePropertiesFromComponents } from './composePropertyValue'
import { safeArray } from './transformerPrimitives'
import { groupByParentId } from './transformerCollections'

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
  
  const filteredRelationships = fetchedRelationships.filter(
    (rel) => rel.kind === relationshipKey && !rel.disabled
  )
  const parentMap = groupByParentId(
    filteredRelationships,
    (rel) => rel.parentId,
    (rel) => rel.childId
  )

  const globalRelationships: GlobalRelationship[] = Array.from(parentMap.entries())
    .map(([parentId, childIds]) => {
      const parentEntity = findById(safeArray(entities[config.parentEntity]), parentId)
      if (!parentEntity) {
        return null
      }
      const childEntityArray = safeArray(entities[config.childEntity])
      const { resolved: childEntities } = resolveByIds(childEntityArray, childIds)
      
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

export function extractChildIds(relationships: GlobalRelationship[]): string[] {
  return relationships.flatMap(rel => 
    rel.children ? rel.children.map(child => child.id) : []
  )
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
  
  const composerRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.id === composerId &&
           rel.parent.entityKey === entityKind
  )
  
  const directComponents = composerRelationships.flatMap(rel =>
    rel.children.map(child => child.id)
  )
  
  // PATTERN: Map each component to its recursive components, then flatten
  const recursiveComponents = directComponents.flatMap((componentId) => {
    const isComponentAlsoComposer = relationships.some(
      rel => rel.relationshipKind === 'instanceComponents' &&
             rel.parent.id === componentId &&
             rel.parent.entityKey === entityKind
    )
    
    if (isComponentAlsoComposer) {
      return getComponentsRecursive(componentId, entityKind, relationships, visited)
    } else {
      return [componentId]
    }
  })
  
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
 * @returns Partial entity with composed properties
 */
function composePropertiesFromRelationships<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
): Partial<GlobalEntity<GE>> {
  const componentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.entityKey === entityKind
  )
  
    const componentIds = getComponentsRecursive(composerId, entityKind, componentRelationships)
  
  if (componentIds.length === 0) {
    return {}
  }
  
  const { resolved: components } = resolveByIds(safeArray(entities[entityKind]), componentIds)
  
  if (components.length === 0) {
    return {}
  }
  
  const composed = composePropertiesFromComponents(
    components,
    entityKind,
    entities.blockShape
  )
  
  return composed as Partial<GlobalEntity<GE>>
}

export function getComposedEntityFromRelationships<GE extends GlobalEntityKey>(
  composerId: string,
  entityKind: GE,
  relationships: GlobalRelationship[],
  entities: Record<GlobalEntityKey, GlobalEntity<GlobalEntityKey>[]>
): GlobalEntity<GE> | null {
  const composerEntity = findById(safeArray(entities[entityKind]), composerId)
  if (!composerEntity) {
    
    return null
  }
  
  // LEARNING: Type assertion needed because entities array is union type
  // PATTERN: Assert to specific entity type when we know the entityKind
  const composer = composerEntity as GlobalEntity<GE>
  
  const componentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'instanceComponents' &&
           rel.parent.entityKey === entityKind
  )
  
  const composed = composePropertiesFromRelationships(
    composerId,
    entityKind,
    componentRelationships,
    entities
  )
  
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
 * PATTERN: Merge partAssignments relationships from all composed blocks
 * 
 * ARCHITECTURAL CHANGE: Now works with GlobalRelationship[] instead of ActiveComponent[]
 * 
 * @param composedBlockIds - Array of composed block instance IDs
 * @param relationships - GlobalRelationship[] for partAssignments
 * @returns Array of part instance IDs
 */
export function composePartInstances(
  composedBlockIds: string[],
  relationships: GlobalRelationship[]
): string[] {
  const constituentRelationships = relationships.filter(
    rel => rel.relationshipKind === 'partAssignments'
  )
  
  // WHY: Avoids nested forEach patterns - flattens nested structure functionally
  // PATTERN: Map blockIds to relationships, then flatMap to part instance IDs
  const partInstanceIds = composedBlockIds.flatMap((blockId) => {
    const blockRelationships = constituentRelationships.filter(
      rel => rel.parent.id === blockId
    )
    return blockRelationships.flatMap(rel => 
      rel.children.map(partInstance => partInstance.id)
    )
  })
  
  // PATTERN: Use Set constructor with array to build Set functionally, then convert back to array
  return Array.from(new Set(partInstanceIds))
}

