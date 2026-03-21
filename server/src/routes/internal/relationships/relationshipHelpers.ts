
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

export type MapRelationshipFieldOptions = {
  userTypeBlockInstanceId?: string | null
}

export function mapAnnotationAssignmentsFields(
  parentId: string,
  childId: string,
  userTypeBlockInstanceId?: string | null
): Record<string, unknown> {
  const userType =
    userTypeBlockInstanceId === undefined || userTypeBlockInstanceId === ''
      ? null
      : userTypeBlockInstanceId
  return {
    blockInstanceId: parentId,
    annotationId: childId,
    userTypeBlockInstanceId: userType,
  }
}

export function mapAttendeeAssignmentsFields(
  parentId: string,
  childId: string
): Record<string, string> {
  return {
    eventShapeId: parentId,
    userTypeBlockInstanceId: childId,
  }
}

async function mapEventAssignmentsFields(
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

export async function mapRelationshipFields(
  relationshipKind: RelationshipKind,
  parentId: string,
  childId: string,
  options?: MapRelationshipFieldOptions
): Promise<Record<string, unknown>> {
  switch (relationshipKind) {
    case RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS:
      return mapAnnotationAssignmentsFields(parentId, childId, options?.userTypeBlockInstanceId)
    case RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS:
      return mapAttendeeAssignmentsFields(parentId, childId)
    case RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS:
      return mapEventAssignmentsFields(parentId, childId)
    default:
      return { parentId, childId }
  }
}

async function getComponentChildIds(instanceId: string): Promise<string[]> {
  const parents = await InstanceComponent.findAll({
    attributes: getModelAttributes(InstanceComponent),
    where: {
      parentId: instanceId,
      disabled: false,
    },
  })
  return parents.map(parent => parent.childId)
}

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
 * 
 * @param parentId - Parent block instance ID
 * @param childId - Child block instance ID
 * @returns Object with parent and child block instances and their shapes
 * @throws Error if entities don't exist or are missing block shapes
 */
type BlockInstanceWithShape = InstanceType<typeof BlockInstance> & { block_shape?: InstanceType<typeof BlockShape> }

export async function validateBlockInstancesWithShapes(
  parentId: string,
  childId: string
): Promise<{
  parentBlockInstance: BlockInstanceWithShape
  childBlockInstance: BlockInstanceWithShape
  parentBlockShape: InstanceType<typeof BlockShape>
  childBlockShape: InstanceType<typeof BlockShape>
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
 * WHY: Validate block shapes are composable
WHY: Components are only allowed fo...
 */
export function validateBlockShapesComposable(
  parentBlockShape: InstanceType<typeof BlockShape>,
  childBlockShape: InstanceType<typeof BlockShape>
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
 * WHY: Restore block instance active state when component is deleted
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
