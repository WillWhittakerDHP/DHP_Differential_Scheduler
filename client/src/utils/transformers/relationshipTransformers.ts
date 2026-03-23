/**
 * Relationship Transformers
 * 
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
 * WHY: Transform FetchedRelationship[] to GlobalRelationship[] format
WHY: Conv...
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

function getComponentsRecursiveCore(
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
      return getComponentsRecursiveCore(componentId, entityKind, relationships, visited)
    } else {
      return [componentId]
    }
  })
  
  return recursiveComponents
}

export function getComponentsRecursive(
  composerId: string,
  entityKind: GlobalEntityKey,
  relationships: GlobalRelationship[],
  visited?: Set<string>
): string[] {
  return getComponentsRecursiveCore(composerId, entityKind, relationships, visited)
}

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
  
    const componentIds = getComponentsRecursiveCore(composerId, entityKind, componentRelationships)
  
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
    instanceComponents: getComponentsRecursiveCore(
      composerId,
      entityKind,
      componentRelationships
    ),
  } as GlobalEntity<GE>
  
  return composedEntity
}

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
