/**
 * RELATIONSHIP FACTORY
 * 
 * Factory functions for generating mock relationships for testing.
 * Provides builders for all GlobalRelationship types.
 */

import type { GlobalRelationship } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'

/**
 * Create a partAssignments relationship (blockInstance -> partInstances)
 */
export function createPartAssignmentsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'partAssignments'> {
  return {
    relationshipKind: 'partAssignments',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'partInstance' } as GlobalEntity<'partInstance'>)),
  }
}

/**
 * Create an instanceComponents relationship (blockInstance -> blockInstances)
 */
export function createActiveComponentsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'instanceComponents'> {
  return {
    relationshipKind: 'instanceComponents',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>)),
  }
}

/**
 * Create an bookingCascades relationship (blockInstance -> blockInstances)
 */
export function createActiveCascadesRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'bookingCascades'> {
  return {
    relationshipKind: 'bookingCascades',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>)),
  }
}

/**
 * Create a validParts relationship (blockShape -> partShapes)
 */
export function createValidPartsRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'validParts'> {
  return {
    relationshipKind: 'validParts',
    parent: { id: parentId, entityKey: 'blockShape' } as GlobalEntity<'blockShape'>,
    children: childIds.map(id => ({ id, entityKey: 'partShape' } as GlobalEntity<'partShape'>)),
  }
}

/**
 * Create a validCascades relationship (blockShape -> blockShapes)
 */
export function createValidCascadesRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'validCascades'> {
  return {
    relationshipKind: 'validCascades',
    parent: { id: parentId, entityKey: 'blockShape' } as GlobalEntity<'blockShape'>,
    children: childIds.map(id => ({ id, entityKey: 'blockShape' } as GlobalEntity<'blockShape'>)),
  }
}

/**
 * Create a dependentInstances relationship (blockInstance -> blockInstances)
 */
export function createDependentInstancesRel(
  parentId: string,
  childIds: string[]
): GlobalRelationship<'dependentInstances'> {
  return {
    relationshipKind: 'dependentInstances',
    parent: { id: parentId, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>,
    children: childIds.map(id => ({ id, entityKey: 'blockInstance' } as GlobalEntity<'blockInstance'>)),
  }
}

/**
 * Create a generic relationship with specified types
 */
export function createRelationship<RK extends GlobalRelationshipKey>(
  relationshipKind: RK,
  parentId: string,
  parentEntityKey: GlobalEntityKey,
  childIds: string[],
  childEntityKey: GlobalEntityKey
): GlobalRelationship<RK> {
  return {
    relationshipKind,
    parent: { id: parentId, entityKey: parentEntityKey } as GlobalEntity<GlobalEntityKey>,
    children: childIds.map(id => ({ id, entityKey: childEntityKey } as GlobalEntity<GlobalEntityKey>)),
  } as GlobalRelationship<RK>
}

/**
 * Create a set of relationships for a composite block with components
 */
export function createCompositeRelationships(
  compositeBlockId: string,
  componentIds: string[],
  partIdsByComponent: Record<string, string[]>
) {
  const instanceComponents = createActiveComponentsRel(compositeBlockId, componentIds)
  
  const partAssignments = componentIds.map(componentId =>
    createPartAssignmentsRel(componentId, partIdsByComponent[componentId] || [])
  )
  
  return {
    instanceComponents,
    partAssignments,
  }
}

