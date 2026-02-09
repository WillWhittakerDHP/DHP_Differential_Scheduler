/**
 * Entity Bulk Operations Router
 * 
 * LEARNING: Extracted bulk operations for entities
 * WHY: Separates bulk operations from CRUD operations, improves maintainability
 * PATTERN: Express router with bulk operation endpoints
 */

import { Router, Request, Response } from 'express'
import { bulkPatch } from '../../helpers/dataController.js'
import { BlockInstance, PartInstance } from '../../../config/app.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'
import { validateBulkUpdateArray } from './entityValidators.js'
import { transformOrderIndexPayload, handleBlockInstanceVersioning } from './entityHelpers.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { createBlockInstanceVersionIfReferenced } from '../../../services/instanceVersioning.js'

const router = Router()

/**
 * PATCH /entities/:entityType/order_index
 * Bulk update order indices for entities
 * 
 * LEARNING: Bulk update order indices for efficient reordering
 * WHY: More efficient than individual PATCH requests (1 request vs N requests)
 * PATTERN: Transform payload, bulk update, return count
 */
router.patch('/:entityType/order_index', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }
  
  try {
    // PATTERN: Transform payload before passing to bulkPatch to match Sequelize model property names
    const transformedUpdates = transformOrderIndexPayload(req.body)
    
    const updatedCount = await bulkPatch(entityConfig.model, transformedUpdates)
    res.json({ updated: updatedCount })
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.BULK_UPDATE_ENTITIES.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'bulk updating order indices')
  }
})

/**
 * PATCH /entities/:entityType/bulk
 * Bulk update multiple entities with partial field updates
 * 
 * LEARNING: Bulk partial update endpoint for efficient multi-entity updates
 * WHY: More efficient than individual PATCH requests (1 request vs N requests)
 * PATTERN: Similar to order_index bulk endpoint but handles versioning for block instances
 * 
 * Request body: Array of { id: string, ...fields } objects
 * 
 * NOTE: Route parameter uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.patch('/:entityType/bulk', async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }
  
  try {
    const updates = req.body
    
    // Validate request body is an array
    const validation = validateBulkUpdateArray(updates)
    if (!validation.valid) {
      res.status(400).json({
        error: validation.error,
        ...validation.details
      })
      return
    }
    
    // CRITICAL: For block instances, capture old state BEFORE update for versioning
    if (req.params.entityType === ENTITY_KEYS.BLOCK_INSTANCE || req.params.entityType === 'blockInstance') {
      // Fetch old instances with part instances for versioning
      const blockInstanceIds = updates.map((update: { id: string }) => update.id)
      
      // PATTERN: Map IDs to versioning operations, then execute in parallel
      await Promise.all(
        blockInstanceIds.map(async (blockInstanceId: string) => {
          const oldInstance = await BlockInstance.findByPk(blockInstanceId, {
            include: [
              {
                model: PartInstance,
                as: 'part_assignment_instances',
                through: {
                  where: { disabled: false },
                },
              }
            ]
          })
          
          if (oldInstance) {
            // Create version with OLD data if referenced by appointments
            await createBlockInstanceVersionIfReferenced(blockInstanceId, oldInstance)
          }
        })
      )
    }
    
    const updatedCount = await bulkPatch(entityConfig.model, updates)
    res.json({ updated: updatedCount })
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.BULK_UPDATE_FAILED.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'bulk updating entities')
  }
})

export { router as EntityBulkRouter }
