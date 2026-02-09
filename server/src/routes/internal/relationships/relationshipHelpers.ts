/**
 * Relationship Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for relationship operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure functions for complex logic
 */

import { 
  BlockInstance, 
  BlockShape, 
  PartInstance, 
  EventShape, 
  InstanceComponent 
} from '../../../config/app.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { type RelationshipKind } from './relationshipConstants.js'

/**
 * Helper function to map generic parent_id/child_id to model-specific field names
 * 
 * LEARNING: Different relationship models use different field names
 * WHY: Models have domain-specific field names (blockInstanceId vs parent_id)
 * PATTERN: Map generic API field names to model-specific attributes
 * 
 * @param relationshipKind - Relationship kind
 * @param parentId - Parent ID
 * @param childId - Child ID
 * @returns Record with model-specific field names
 */
export async function mapRelationshipFields(
  relationshipKind: RelationshipKind,
  parentId: string,
  childId: string
): Promise<Record<string, string>> {
  switch (relationshipKind) {
    case RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS:
      return {
        blockInstanceId: parentId,
        annotationId: childId,
      }
    case RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS:
      return {
        eventShapeId: parentId,
        userTypeBlockInstanceId: childId,
      }
    case RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS: {
      // LEARNING: eventAssignments uses parent_id/child_id pattern with parent_kind enum
      // WHY: Matches partAssignments pattern exactly for consistency
      // PATTERN: Determine parent_kind by checking which table parentId exists in
      const partInstance = await PartInstance.findByPk(parentId)
      if (partInstance) {
        return {
          parent_id: parentId,
          parentKind: 'partInstance',
          child_id: childId,
        }
      }
      const blockInstance = await BlockInstance.findByPk(parentId)
      if (blockInstance) {
        return {
          parent_id: parentId,
          parentKind: 'blockInstance',
          child_id: childId,
        }
      }
      throw new Error(`Parent ID ${parentId} is not a valid PartInstance or BlockInstance for eventAssignments`)
    }
    default:
      return {
        parent_id: parentId,
        child_id: childId,
      }
  }
}

/**
 * Helper function to check for circular references in component relationships
 * 
 * LEARNING: Circular reference detection prevents infinite loops
 * WHY: Components can themselves be parents, but we must prevent cycles
 * PATTERN: Functional BFS traversal without array mutations
 * 
 * @param parentId - Parent ID to check
 * @param childId - Child ID to check
 * @returns true if circular reference would be created
 */
export async function hasCircularReference(
  parentId: string,
  childId: string
): Promise<boolean> {
  const visited = new Set<string>()
  
  /**
   * Functional BFS helper that processes queue without mutations
   * LEARNING: Uses array destructuring and spread to rebuild queue functionally
   * WHY: Avoids queue.shift() and queue.push() mutations
   * PATTERN: Process head of queue, rebuild tail with new items
   */
  async function processQueue(queue: string[]): Promise<boolean> {
    if (queue.length === 0) {
      return false
    }
    
    const [currentId, ...remainingQueue] = queue
    
    if (currentId === parentId) {
      return true // Circular reference detected
    }
    
    if (visited.has(currentId)) {
      return processQueue(remainingQueue)
    }
    
    visited.add(currentId)
    
    const parents = await InstanceComponent.findAll({
      attributes: getModelAttributes(InstanceComponent),
      where: {
        parent_id: currentId,
        disabled: false,
      },
    })
    
    // PATTERN: Map parents to child_ids, filter unvisited, append to remaining queue
    const childIds = parents
      .map(parent => parent.child_id)
      .filter(id => !visited.has(id))
    
    const nextQueue = [...remainingQueue, ...childIds]
    
    return processQueue(nextQueue)
  }
  
  return processQueue([childId])
}

/**
 * Validate block instances exist and have block shapes
 * LEARNING: Validates block instances exist and have associated block shapes
 * WHY: Ensures entities exist before creating relationships
 * PATTERN: Fetch entities with associations, validate existence
 * 
 * @param parentId - Parent block instance ID
 * @param childId - Child block instance ID
 * @returns Object with parent and child block instances and their shapes
 * @throws Error if entities don't exist or are missing block shapes
 */
export async function validateBlockInstancesWithShapes(
  parentId: string,
  childId: string
): Promise<{
  parentBlockInstance: any
  childBlockInstance: any
  parentBlockShape: any
  childBlockShape: any
}> {
  const parentBlockInstance = await BlockInstance.findByPk(parentId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
  const childBlockInstance = await BlockInstance.findByPk(childId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
  
  if (!parentBlockInstance || !childBlockInstance) {
    throw new Error('BlockInstance not found')
  }
  
  // PATTERN: Cast to any to access association, then cast association to proper type
  const parentBlockInstanceWithShape = parentBlockInstance as any
  const parentBlockShape = parentBlockInstanceWithShape.block_shape as InstanceType<typeof BlockShape> | undefined
  
  if (!parentBlockShape) {
    throw new Error(`BlockInstance parent missing BlockShape: ${parentId}`)
  }
  
  const childBlockInstanceWithShape = childBlockInstance as any
  const childBlockShape = childBlockInstanceWithShape.block_shape as InstanceType<typeof BlockShape> | undefined
  
  if (!childBlockShape) {
    throw new Error(`BlockInstance child missing BlockShape: ${childId}`)
  }
  
  return {
    parentBlockInstance,
    childBlockInstance,
    parentBlockShape,
    childBlockShape,
  }
}

/**
 * Validate block shapes are composable
 * LEARNING: Validates block shapes allow component relationships
 * WHY: Components are only allowed for composable block shapes
 * PATTERN: Check composable property on block shapes
 * 
 * @param parentBlockShape - Parent block shape
 * @param childBlockShape - Child block shape
 * @throws Error if block shapes are not composable
 */
export function validateBlockShapesComposable(
  parentBlockShape: any,
  childBlockShape: any
): void {
  if (!parentBlockShape.composable) {
    throw new Error(`BlockShape '${parentBlockShape.name}' is not composable. Components are only allowed for BlockInstances with composable BlockShapes.`)
  }
  
  if (!childBlockShape.composable) {
    throw new Error(`BlockShape '${childBlockShape.name}' is not composable. Components are only allowed for BlockInstances with composable BlockShapes.`)
  }
  
  if (parentBlockShape.id !== childBlockShape.id) {
    throw new Error('Components must have the same BlockShape as their parent')
  }
}

/**
 * Validate attendee assignment entities
 * LEARNING: Validates event shape and block instance exist for attendee assignments
 * WHY: Ensures entities exist and block instance is a UserTypeBlock
 * PATTERN: Fetch entities, validate existence and type
 * 
 * @param parentId - Event shape ID
 * @param childId - Block instance ID
 * @throws Error if entities don't exist or block instance is not a UserTypeBlock
 */
export async function validateAttendeeAssignmentEntities(
  parentId: string,
  childId: string
): Promise<void> {
  const eventShape = await EventShape.findByPk(parentId)
  if (!eventShape) {
    throw new Error(`EventShape with ID ${parentId} does not exist`)
  }
  
  const blockInstance = await BlockInstance.findByPk(childId)
  if (!blockInstance) {
    throw new Error(`BlockInstance with ID ${childId} does not exist`)
  }
  
  // LEARNING: Verify that the BlockInstance is a UserTypeBlock (state control block)
  // PATTERN: Check blockShape.isStateControl === true, but handle gracefully if blockShapeRef is missing
  if (blockInstance.blockShapeRef) {
    const blockShape = await BlockShape.findByPk(blockInstance.blockShapeRef)
    if (!blockShape) {
      throw new Error(`BlockInstance ${childId} references non-existent BlockShape ${blockInstance.blockShapeRef}`)
    }
    if (!blockShape.isStateControl) {
      throw new Error(`BlockInstance ${childId} is not a UserTypeBlock (isStateControl must be true)`)
    }
  }
}

/**
 * Update block instance active state for component relationships
 * LEARNING: Updates active state when component relationships are created
 * WHY: Child components should be inactive, parent should be active
 * PATTERN: Update active property based on component relationship
 * 
 * @param parentId - Parent block instance ID
 * @param childId - Child block instance ID
 */
export async function updateComponentActiveStates(
  parentId: string,
  childId: string
): Promise<void> {
  const childBlockInstance = await BlockInstance.findByPk(childId)
  if (childBlockInstance) {
    childBlockInstance.active = false
    await childBlockInstance.save()
  }
  
  const parentBlockInstance = await BlockInstance.findByPk(parentId)
  if (parentBlockInstance) {
    parentBlockInstance.active = true
    await parentBlockInstance.save()
  }
}

/**
 * Restore block instance active state when component is deleted
 * LEARNING: Restores active state when component relationship is deleted
 * WHY: Child should become active if no longer in any component relationships
 * PATTERN: Check if child has other components, restore active if not
 * 
 * @param childId - Child block instance ID
 */
export async function restoreComponentActiveState(childId: string): Promise<void> {
  const otherComponents = await InstanceComponent.count({
    where: {
      child_id: childId,
      disabled: false,
    },
  })
  
  if (otherComponents === 0) {
    const childBlockInstance = await BlockInstance.findByPk(childId)
    if (childBlockInstance) {
      childBlockInstance.active = true
      await childBlockInstance.save()
    }
  }
}
