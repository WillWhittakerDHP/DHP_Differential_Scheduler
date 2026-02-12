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
  InstanceComponent,
  ValidPricingCascade,
} from '../../../config/app.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { type RelationshipKind, ERROR_MESSAGES } from './relationshipConstants.js'
import type { ValidationResult } from '../../helpers/routerValidators.js'

/**
 * Map annotation assignment API fields to model-specific field names
 */
export function mapAnnotationAssignmentsFields(
  parentId: string,
  childId: string
): Record<string, string> {
  return {
    blockInstanceId: parentId,
    annotationId: childId,
  }
}

/**
 * Map attendee assignment API fields to model-specific field names
 */
export function mapAttendeeAssignmentsFields(
  parentId: string,
  childId: string
): Record<string, string> {
  return {
    eventShapeId: parentId,
    userTypeBlockInstanceId: childId,
  }
}

/**
 * Map event assignment API fields; resolves parent kind (partInstance vs blockInstance)
 */
export async function mapEventAssignmentsFields(
  parentId: string,
  childId: string
): Promise<Record<string, string>> {
  const partInstance = await PartInstance.findByPk(parentId)
  if (partInstance) {
    return { parentId, parentKind: 'partInstance', childId }
  }
  const blockInstance = await BlockInstance.findByPk(parentId)
  if (blockInstance) {
    return { parentId, parentKind: 'blockInstance', childId }
  }
  throw new Error(`Parent ID ${parentId} is not a valid PartInstance or BlockInstance for eventAssignments`)
}

/**
 * Helper function to map generic parent_id/child_id to model-specific field names
 *
 * LEARNING: Different relationship models use different field names
 * WHY: Models have domain-specific field names (blockInstanceId vs parent_id)
 * PATTERN: Dispatcher that delegates to kind-specific mappers
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
      return mapAnnotationAssignmentsFields(parentId, childId)
    case RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS:
      return mapAttendeeAssignmentsFields(parentId, childId)
    case RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS:
      return mapEventAssignmentsFields(parentId, childId)
    default:
      return { parentId, childId }
  }
}

/**
 * Get child instance IDs for a given parent in the component graph
 * LEARNING: Extracted for BFS; single place for InstanceComponent query
 */
export async function getComponentChildIds(instanceId: string): Promise<string[]> {
  const parents = await InstanceComponent.findAll({
    attributes: getModelAttributes(InstanceComponent),
    where: {
      parentId: instanceId,
      disabled: false,
    },
  })
  return parents.map(parent => parent.childId)
}

/**
 * Helper function to check for circular references in component relationships
 *
 * LEARNING: Circular reference detection prevents infinite loops
 * WHY: Components can themselves be parents, but we must prevent cycles
 * PATTERN: BFS using getComponentChildIds; max nesting kept low
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
  let queue: string[] = [childId]

  while (queue.length > 0) {
    const [currentId, ...remainingQueue] = queue

    if (currentId === parentId) {
      return true
    }
    if (visited.has(currentId)) {
      queue = remainingQueue
      continue
    }
    visited.add(currentId)

    const childIds = await getComponentChildIds(currentId)
    const newIds = childIds.filter(id => !visited.has(id))
    queue = [...remainingQueue, ...newIds]
  }

  return false
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
    throw new Error(ERROR_MESSAGES.BLOCK_INSTANCE_NOT_FOUND)
  }
  
  type BlockInstanceWithShape = InstanceType<typeof BlockInstance> & { block_shape?: InstanceType<typeof BlockShape> }
  const parentBlockShape = (parentBlockInstance as BlockInstanceWithShape).block_shape
  if (!parentBlockShape) {
    throw new Error(`BlockInstance parent missing BlockShape: ${parentId}`)
  }
  const childBlockShape = (childBlockInstance as BlockInstanceWithShape).block_shape
  
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

const NOT_COMPOSABLE_MSG = (name: string): string =>
  `BlockShape '${name}' is not composable. Components are only allowed for BlockInstances with composable BlockShapes.`

/**
 * Validate block shapes are composable
 * LEARNING: Validates block shapes allow component relationships
 * WHY: Components are only allowed for composable block shapes
 * PATTERN: Early returns with clear error messages
 */
export function validateBlockShapesComposable(
  parentBlockShape: any,
  childBlockShape: any
): void {
  if (!parentBlockShape.composable) {
    throw new Error(NOT_COMPOSABLE_MSG(parentBlockShape.name))
  }
  if (!childBlockShape.composable) {
    throw new Error(NOT_COMPOSABLE_MSG(childBlockShape.name))
  }
  if (parentBlockShape.id !== childBlockShape.id) {
    throw new Error(ERROR_MESSAGES.DIFFERENT_BLOCK_SHAPES)
  }
}

/**
 * Validate pricing cascade against shape-level validPricingCascades rules.
 * LEARNING: Instance-level pricingCascades must match a partShape->partShape validPricingCascade.
 * WHY: Ensures only allowed part-shape pairs can form pricing cascade relationships.
 *
 * @param parentPartInstanceId - Parent part instance ID
 * @param childPartInstanceId - Child part instance ID
 * @returns ValidationResult
 */
export async function validatePricingCascadeAgainstShapeRules(
  parentPartInstanceId: string,
  childPartInstanceId: string
): Promise<ValidationResult> {
  const parentPart = await PartInstance.findByPk(parentPartInstanceId)
  const childPart = await PartInstance.findByPk(childPartInstanceId)
  if (!parentPart) {
    return { valid: false, error: `Parent PartInstance ${parentPartInstanceId} not found` }
  }
  if (!childPart) {
    return { valid: false, error: `Child PartInstance ${childPartInstanceId} not found` }
  }
  const parentShapeRef = parentPart.partShapeRef
  const childShapeRef = childPart.partShapeRef
  const validRow = await ValidPricingCascade.findOne({
    where: {
      parentId: parentShapeRef,
      childId: childShapeRef,
      disabled: false,
    },
  })
  if (!validRow) {
    return { valid: false, error: ERROR_MESSAGES.PRICING_CASCADE_SHAPE_NOT_VALID }
  }
  return { valid: true }
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
 * PATTERN: Early return when child still has components; single path to restore
 */
export async function restoreComponentActiveState(childId: string): Promise<void> {
  const otherComponents = await InstanceComponent.count({
    where: { childId, disabled: false },
  })
  if (otherComponents > 0) {
    return
  }
  const childBlockInstance = await BlockInstance.findByPk(childId)
  if (!childBlockInstance) {
    return
  }
  childBlockInstance.active = true
  await childBlockInstance.save()
}
