/**
 * Entity Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for entity operations
 * WHY: Improves code reusability, reduces complexity, improves maintainability
 * PATTERN: Pure helper functions with proper types
 */

import { Op, ModelStatic, Model } from 'sequelize'
import { BlockInstance, PartInstance, PartAssignment } from '../../../config/app.js'
import { createBlockInstanceVersionIfReferenced } from '../../../services/instanceVersioning.js'
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js'
import { FIELD_NAMES, SORT_ORDERS } from './entityConstants.js'
import { createLogger } from '../../../utils/logger.js'
import { ERROR_MESSAGES } from './entityConstants.js'

const logger = createLogger('EntityRouter')

/**
 * Ensure block instance versions exist before bulk update (captures old state for versioning).
 * LEARNING: Used by PATCH /:entityType/bulk when entityType is blockInstance.
 * WHY: Reduces nesting in route handler; versioning must run before bulkPatch.
 *
 * @param updates - Array of update objects with id (block instance IDs)
 */
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

/**
 * Handle block instance versioning before update/delete
 * LEARNING: Extracted versioning logic for block instances
 * WHY: Reusable versioning logic, ensures old state is captured before changes
 * PATTERN: Fetch old instance with associations, create version if referenced
 * 
 * @param blockInstanceId - Block instance ID
 * @param includeParts - Whether to include part instances in the fetch (default: true)
 * @returns Old block instance with associations, or null if not found
 */
export async function handleBlockInstanceVersioning(
  blockInstanceId: string,
  includeParts: boolean = true
): Promise<any | null> {
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

/**
 * Handle part instance cleanup after update
 * LEARNING: Extracted part assignment cleanup logic
 * WHY: Reusable cleanup logic, disables old relationships after part instance update
 * PATTERN: Find duplicate part instances, disable old relationships
 * 
 * @param partInstanceId - Part instance ID
 */
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
        disabled: false
      }
    })

    // PATTERN: Use map to transform relationships into promises, then await all
    await Promise.all(
      currentRelationships.map(async (currentRel) => {
        const duplicatePartInstances = await PartInstance.findAll({
          where: {
            name: updatedPartInstance.name,
            partShapeRef: updatedPartInstance.partShapeRef,
            id: { [Op.ne]: partInstanceId }
          }
        })

        if (duplicatePartInstances.length > 0) {
          const duplicatePartIds = duplicatePartInstances.map(p => p.id)
          
          await PartAssignment.update(
            { disabled: true },
            {
              where: {
                parentId: currentRel.parentId,
                childId: { [Op.in]: duplicatePartIds },
                disabled: false
              }
            }
          )
        }
      })
    )
  } catch (error) {
    logger.error(ERROR_MESSAGES.PART_ASSIGNMENT_CLEANUP_ERROR, error)
    // Don't throw - cleanup errors shouldn't fail the update
  }
}

/**
 * Build fetch options for entity queries
 * LEARNING: Extracted options building logic from GET /:entityType
 * WHY: Reusable options building, ensures consistent ordering
 * PATTERN: Check model attributes, build options with appropriate ordering
 * 
 * @param model - Sequelize model class
 * @returns Options object for Sequelize findAll/findByPk
 */
export function buildFetchOptions(model: ModelStatic<Model>): {
  attributes?: string[]
  order?: any[]
  include?: any[]
} {
  const rawAttrs = model.rawAttributes
  const modelAttributes = Object.keys(rawAttrs !== undefined && rawAttrs !== null ? rawAttrs : {})
  const baseOptions: { attributes?: string[]; order?: any[]; include?: any[] } = {}
  
  const optionsWithAttributes = isModelUnderscored(model)
    ? { ...baseOptions, attributes: getModelAttributes(model) }
    : baseOptions
  
  const options = (() => {
    if (modelAttributes.includes(FIELD_NAMES.ORDER_INDEX)) {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.ORDER_INDEX, SORT_ORDERS.ASC]] }
    } else if (modelAttributes.includes(FIELD_NAMES.CREATED_AT)) {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.ASC]] }
    } else {
      return { ...optionsWithAttributes, order: [[FIELD_NAMES.ID, SORT_ORDERS.ASC]] }
    }
  })()
  
  return options
}

