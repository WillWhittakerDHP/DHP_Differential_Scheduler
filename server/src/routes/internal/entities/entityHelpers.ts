
import { Op, ModelStatic, Model, Order, Includeable } from 'sequelize'
import { BlockInstance, PartInstance, PartAssignment } from '../../../config/app.js'
import { createBlockInstanceVersionIfReferenced } from '../../../services/instanceVersioning.js'
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js'
import { FIELD_NAMES, SORT_ORDERS } from './entityConstants.js'
import { createLogger } from '../../../utils/logger.js'
import { ERROR_MESSAGES } from './entityConstants.js'

const logger = createLogger('EntityRouter')

export async function ensureBlockInstanceVersionsBeforeBulkUpdate(
  updates: Array<{ id: string }>
): Promise<void> {
  const blockInstanceIds = updates.map((u) => u.id)
  await Promise.all(
    blockInstanceIds.map((blockInstanceId) =>
      handleBlockInstanceVersioning(blockInstanceId, true)
    )
  )
}

export async function handleBlockInstanceVersioning(
  blockInstanceId: string,
  includeParts: boolean = true
): Promise<InstanceType<typeof BlockInstance> | null> {
  const includeOptions = includeParts ? [
    {
      model: PartInstance,
      as: 'part_assignment_instances',
      through: {
        where: { disabled: false },
      },
    }
  ] : []
  
  const oldInstance = await BlockInstance.findByPk(blockInstanceId, {
    include: includeOptions
  })
  
  if (!oldInstance) {
    return null
  }
  
  // Create version with OLD data if referenced by appointments
  await createBlockInstanceVersionIfReferenced(blockInstanceId, oldInstance)
  
  return oldInstance
}

async function disableDuplicatesForPartAssignmentRelationship(
  currentRel: InstanceType<typeof PartAssignment>,
  updatedPartInstance: InstanceType<typeof PartInstance>,
  partInstanceId: string
): Promise<void> {
  const duplicatePartInstances = await PartInstance.findAll({
    where: {
      name: updatedPartInstance.name,
      partShapeRef: updatedPartInstance.partShapeRef,
      id: { [Op.ne]: partInstanceId },
    },
  })

  if (duplicatePartInstances.length === 0) {
    return
  }

  const duplicatePartIds = duplicatePartInstances.map((p) => p.id)

  await PartAssignment.update(
    { disabled: true },
    {
      where: {
        parentId: currentRel.parentId,
        childId: { [Op.in]: duplicatePartIds },
        disabled: false,
      },
    }
  )
}

export async function handlePartInstanceCleanup(
  partInstanceId: string
): Promise<void> {
  try {
    const updatedPartInstance = await PartInstance.findByPk(partInstanceId)
    if (!updatedPartInstance) {
      return
    }

    const currentRelationships = await PartAssignment.findAll({
      where: {
        childId: partInstanceId,
        disabled: false,
      },
    })

    await Promise.all(
      currentRelationships.map((currentRel) =>
        disableDuplicatesForPartAssignmentRelationship(currentRel, updatedPartInstance, partInstanceId)
      )
    )
  } catch (error) {
    logger.error(ERROR_MESSAGES.PART_ASSIGNMENT_CLEANUP_ERROR, error)
  }
}

export function buildFetchOptions(model: ModelStatic<Model>): {
  attributes?: string[]
  order?: Order
  include?: Includeable[]
} {
  const rawAttrs = model.rawAttributes
  const modelAttributes = Object.keys(rawAttrs !== undefined && rawAttrs !== null ? rawAttrs : {})
  const baseOptions: { attributes?: string[]; order?: Order; include?: Includeable[] } = {}
  
  const optionsWithAttributes = isModelUnderscored(model)
    ? { ...baseOptions, attributes: getModelAttributes(model) }
    : baseOptions
  
  const options = (() => {
    if (modelAttributes.includes(FIELD_NAMES.ORDER_INDEX)) {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.ORDER_INDEX, SORT_ORDERS.ASC]] as Order }
    } else if (modelAttributes.includes(FIELD_NAMES.CREATED_AT)) {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.ASC]] as Order }
    } else {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.ID, SORT_ORDERS.ASC]] as Order }
    }
  })()
  
  return options
}

