import {
  BlockInstance,
  BlockShape,
  PartInstance,
  PartAssignment,
  EventInstance,
  EventShape,
  InstanceComponent,
  ValidEventCascade,
  ValidPricingCascade,
} from '../../../config/app.js'
import { getModelAttributes } from '../../../utils/sequelizeHelpers.js'
import { WIZARD_PLACEMENT } from '@shared/constants/wizardPlacement.js'
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
 * WHY: Vertical packaging — the *parent* is the composite package; children are
 * same-shape atomics (composite=false), matching Buyer's Inspection → Equipment
 * Observations and Property Details → Roof/Exterior.
 * LEARNING: Requiring child.composite=true contradicted live data and blocked saves.
 */
export function validateBlockInstancesCompositeForComponents(
  parentBlockInstance: BlockInstanceWithShape,
  _childBlockInstance: BlockInstanceWithShape,
  parentBlockShape: InstanceType<typeof BlockShape>,
  childBlockShape: InstanceType<typeof BlockShape>
): void {
  if (!parentBlockInstance.composite) {
    throw new Error(REL_ERROR_MESSAGES.NOT_COMPOSABLE)
  }
  if (parentBlockShape.id !== childBlockShape.id) {
    throw new Error(REL_ERROR_MESSAGES.DIFFERENT_BLOCK_SHAPES)
  }
}

/**
 * WHY: Accumulation is atomic service → atomic time only (same BlockShape types allowed
 * by the admin picker; composites use instanceComponents instead).
 */
export async function validateAccumulationLinkEntities(
  parentId: string,
  childId: string
): Promise<ValidationResult> {
  const { parentBlockInstance, childBlockInstance, parentBlockShape, childBlockShape } =
    await validateBlockInstancesWithShapes(parentId, childId)

  if (parentBlockInstance.composite === true) {
    return {
      valid: false,
      error: 'Accumulation links require an atomic (non-composite) parent service instance',
    }
  }
  if (childBlockInstance.composite === true) {
    return {
      valid: false,
      error: 'Accumulation links require an atomic (non-composite) time characteristic child',
    }
  }
  if (parentBlockShape.semanticType !== 'service') {
    return {
      valid: false,
      error: 'Accumulation link parent must be a service block instance',
    }
  }
  if (childBlockShape.semanticType !== 'time') {
    return {
      valid: false,
      error: 'Accumulation link child must be a time block instance',
    }
  }
  return { valid: true }
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

async function validateEventAssignmentAgainstSegmentBlockShape(params: {
  segmentBlockInstance: BlockInstanceWithShape
  eventInstance: Pick<InstanceType<typeof EventInstance>, 'eventShapeRef'>
}): Promise<ValidationResult> {
  const { segmentBlockInstance, eventInstance } = params
  const segmentBlockShape = segmentBlockInstance.block_shape
  if (!segmentBlockShape) {
    return {
      valid: false,
      error: `Block instance ${segmentBlockInstance.id} has no block shape`,
    }
  }
  if (segmentBlockShape.semanticType !== 'event') {
    return { valid: false, error: 'Event segment must be owned by an event-type block instance' }
  }

  const validRow = await ValidEventCascade.findOne({
    where: {
      parentId: segmentBlockShape.id,
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
 * WHY: Load segment + owning event block for cascade checks shared by service baseline and event-owner edges.
 */
async function loadEventSegmentWithOwner(
  eventInstanceId: string
): Promise<
  | { valid: true; eventInstance: InstanceType<typeof EventInstance>; segmentOwner: BlockInstanceWithShape }
  | { valid: false; error: string }
> {
  const eventInstance = await EventInstance.findByPk(eventInstanceId, {
    attributes: ['id', 'eventShapeRef', 'parentBlockInstanceId'],
  })
  if (!eventInstance) {
    return { valid: false, error: `Event instance ${eventInstanceId} not found` }
  }
  const segmentParentId = eventInstance.parentBlockInstanceId
  if (segmentParentId == null || segmentParentId === '') {
    return {
      valid: false,
      error: 'Event segment must have parentBlockInstanceId before creating an event assignment',
    }
  }
  const segmentOwner = await BlockInstance.findByPk(segmentParentId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
  if (!segmentOwner) {
    return { valid: false, error: `Event segment parent block instance ${segmentParentId} not found` }
  }
  return {
    valid: true,
    eventInstance,
    segmentOwner: segmentOwner as BlockInstanceWithShape,
  }
}

/**
 * WHY: Block-parent event_assignments are either:
 * - service baseline (service block → any segment; cascade checked against the segment's owning event block), or
 * - event packaging (event block → a segment it owns).
 * Time/price/user parents are rejected (retired time-block claim path).
 */
async function validateEventAssignmentBlockParent(
  parentBlockInstance: BlockInstanceWithShape,
  eventInstanceId: string
): Promise<ValidationResult> {
  const parentBlockInstanceId = parentBlockInstance.id
  const parentBlockShape = parentBlockInstance.block_shape
  if (!parentBlockShape) {
    return { valid: false, error: `Block instance ${parentBlockInstanceId} has no block shape` }
  }

  const semanticType = parentBlockShape.semanticType
  if (semanticType !== 'service' && semanticType !== 'event') {
    return {
      valid: false,
      error:
        'Event assignment block parent must be a service block (baseline) or an event block that owns the segment',
    }
  }

  const loaded = await loadEventSegmentWithOwner(eventInstanceId)
  if (!loaded.valid) {
    return loaded
  }
  const { eventInstance, segmentOwner } = loaded

  if (semanticType === 'event') {
    if (segmentOwner.id !== parentBlockInstanceId) {
      return {
        valid: false,
        error: 'Event segment parent block instance does not match this relationship parent',
      }
    }
    return validateEventAssignmentAgainstSegmentBlockShape({
      segmentBlockInstance: parentBlockInstance,
      eventInstance,
    })
  }

  // Service baseline: parent does not own the segment; cascade still validates against the owner shape.
  return validateEventAssignmentAgainstSegmentBlockShape({
    segmentBlockInstance: segmentOwner,
    eventInstance,
  })
}

/**
 * WHY: Per-part override routing — parent is a part instance; segment ownership and cascades still apply.
 */
async function validateEventAssignmentPartParent(
  partInstance: InstanceType<typeof PartInstance>,
  eventInstanceId: string
): Promise<ValidationResult> {
  const assignmentRow = await PartAssignment.findOne({
    where: {
      childId: partInstance.id,
      disabled: false,
    },
  })
  if (!assignmentRow) {
    return {
      valid: false,
      error:
        'Part instance must be assigned to at least one block instance before creating a part-scoped event assignment',
    }
  }

  const loaded = await loadEventSegmentWithOwner(eventInstanceId)
  if (!loaded.valid) {
    return loaded
  }

  return validateEventAssignmentAgainstSegmentBlockShape({
    segmentBlockInstance: loaded.segmentOwner,
    eventInstance: loaded.eventInstance,
  })
}

/**
 * WHY: EventAssignment links a **service block** (baseline), an **event block** that owns the segment
 * (packaging), or a **part instance** (override) to a **segment**; segment ownership and shape graph
 * must match (FEATURE_20 §5.2, PartFinalizer / flagship Minimize Time On Site).
 */
export async function validateEventAssignmentIntegrity(
  parentId: string,
  eventInstanceId: string
): Promise<ValidationResult> {
  const asBlockParent = await BlockInstance.findByPk(parentId, {
    include: [{ model: BlockShape, as: 'block_shape' }],
  })
  if (asBlockParent) {
    return validateEventAssignmentBlockParent(asBlockParent as BlockInstanceWithShape, eventInstanceId)
  }

  const asPartParent = await PartInstance.findByPk(parentId)
  if (asPartParent) {
    return validateEventAssignmentPartParent(asPartParent, eventInstanceId)
  }

  return {
    valid: false,
    error: `Parent ID ${parentId} is not a block instance or part instance`,
  }
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
    if (blockShape.semanticType !== 'user') {
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
    // Bundled component children roll up into the composite parent; they should not
    // surface independently in the wizard.
    childBlockInstance.wizardPlacement = WIZARD_PLACEMENT.HIDDEN
    await childBlockInstance.save()
  }

  const parentBlockInstance = await BlockInstance.findByPk(parentId)
  if (parentBlockInstance) {
    parentBlockInstance.wizardPlacement = WIZARD_PLACEMENT.TOP_LINE
    await parentBlockInstance.save()
  }
}

/**
 * WHY: Restore block instance wizard placement when component is deleted
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
  childBlockInstance.wizardPlacement = WIZARD_PLACEMENT.TOP_LINE
  await childBlockInstance.save()
}
