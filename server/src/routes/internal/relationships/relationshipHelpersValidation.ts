import {
  BlockInstance,
  BlockShape,
  PartInstance,
  EventInstance,
  EventShape,
  InstanceComponent,
  ValidEventCascade,
  ValidPricingCascade,
} from '../../../config/app.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { ERROR_MESSAGES as REL_ERROR_MESSAGES } from './relationshipConstants.js'
import type { ValidationResult } from '../../helpers/routerValidators.js'

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
    throw new Error(REL_ERROR_MESSAGES.BLOCK_INSTANCE_NOT_FOUND)
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

/**
 * WHY: Instance components require both instances composite=true and matching BlockShape (Feature 20).
 */
export function validateBlockInstancesCompositeForComponents(
  parentBlockInstance: BlockInstanceWithShape,
  childBlockInstance: BlockInstanceWithShape,
  parentBlockShape: InstanceType<typeof BlockShape>,
  childBlockShape: InstanceType<typeof BlockShape>
): void {
  if (!parentBlockInstance.composite || !childBlockInstance.composite) {
    throw new Error(REL_ERROR_MESSAGES.NOT_COMPOSABLE)
  }
  if (parentBlockShape.id !== childBlockShape.id) {
    throw new Error(REL_ERROR_MESSAGES.DIFFERENT_BLOCK_SHAPES)
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
    return { valid: false, error: REL_ERROR_MESSAGES.PRICING_CASCADE_SHAPE_NOT_VALID }
  }
  return { valid: true }
}

/**
 * WHY: EventAssignment links an event **block instance** to a **segment**; segment ownership and shape graph must match (FEATURE_20 §5.2, §5.1).
 */
export async function validateEventAssignmentIntegrity(
  parentBlockInstanceId: string,
  eventInstanceId: string
): Promise<ValidationResult> {
  const parentBlockInstance = await BlockInstance.findByPk(parentBlockInstanceId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
  if (!parentBlockInstance) {
    return { valid: false, error: `Parent block instance ${parentBlockInstanceId} not found` }
  }
  const parentBlockShape = (parentBlockInstance as BlockInstanceWithShape).block_shape
  if (!parentBlockShape) {
    return { valid: false, error: `Block instance ${parentBlockInstanceId} has no block shape` }
  }
  if (parentBlockShape.type !== 'event') {
    return { valid: false, error: 'Event assignment parent must be an event-type block instance' }
  }

  const eventInstance = await EventInstance.findByPk(eventInstanceId, {
    attributes: ['id', 'eventShapeRef', 'parentBlockInstanceId'],
  })
  if (!eventInstance) {
    return { valid: false, error: `Event instance ${eventInstanceId} not found` }
  }
  const segmentParent = eventInstance.parentBlockInstanceId
  if (segmentParent == null || segmentParent === '') {
    return {
      valid: false,
      error: 'Event segment must have parentBlockInstanceId before creating an event assignment',
    }
  }
  if (segmentParent !== parentBlockInstanceId) {
    return {
      valid: false,
      error: 'Event segment parent block instance does not match this relationship parent',
    }
  }

  const validRow = await ValidEventCascade.findOne({
    where: {
      parentId: parentBlockShape.id,
      childId: eventInstance.eventShapeRef,
      disabled: false,
    },
  })
  if (!validRow) {
    return {
      valid: false,
      error:
        'No active valid event cascade links this event shape to the parent block shape; add one on the block shape first',
    }
  }
  return { valid: true }
}

/**
 * WHY: validEventCascades rows reference block shape + event shape ids — reject unknown ids before ORM/FK noise.
 */
export async function validateValidEventCascadeShapeIds(
  blockShapeId: string,
  eventShapeId: string
): Promise<ValidationResult> {
  const blockShape = await BlockShape.findByPk(blockShapeId)
  if (!blockShape) {
    return { valid: false, error: `Block shape ${blockShapeId} not found` }
  }
  const eventShape = await EventShape.findByPk(eventShapeId)
  if (!eventShape) {
    return { valid: false, error: `Event shape ${eventShapeId} not found` }
  }
  return { valid: true }
}

/**
 * Validate attendee assignment entities
 *
 * @param parentId - Event instance ID (segment)
 * @param childId - Block instance ID
 * @throws Error if entities don't exist or block instance is not a UserTypeBlock
 */
export async function validateAttendeeAssignmentEntities(
  parentId: string,
  childId: string
): Promise<void> {
  const eventInstance = await EventInstance.findByPk(parentId)
  if (!eventInstance) {
    throw new Error(`EventInstance with ID ${parentId} does not exist`)
  }

  if (eventInstance.parentBlockInstanceId == null || eventInstance.parentBlockInstanceId === '') {
    throw new Error(
      'Event segment has no parent block instance; set parent on the event instance before attendee links'
    )
  }

  const blockInstance = await BlockInstance.findByPk(childId)
  if (!blockInstance) {
    throw new Error(`BlockInstance with ID ${childId} does not exist`)
  }

  if (blockInstance.blockShapeRef) {
    const blockShape = await BlockShape.findByPk(blockInstance.blockShapeRef)
    if (!blockShape) {
      throw new Error(`BlockInstance ${childId} references non-existent BlockShape ${blockInstance.blockShapeRef}`)
    }
    if (blockShape.type !== 'user') {
      throw new Error(`BlockInstance ${childId} is not a UserTypeBlock (block shape type must be user)`)
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
