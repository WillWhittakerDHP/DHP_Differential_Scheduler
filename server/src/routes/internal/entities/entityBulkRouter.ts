/**
 * Entity Bulk Operations Router
 * 
 * LEARNING: Extracted bulk operations for entities
 * WHY: Separates bulk operations from CRUD operations, improves maintainability
 * PATTERN: Express router with bulk operation endpoints
 */

import { Router, Request, Response } from 'express'
import { bulkPatch } from '../../helpers/dataController.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'
import { validateBulkUpdateArray } from './entityValidators.js'
import { ensureBlockInstanceVersionsBeforeBulkUpdate } from './entityHelpers.js'
import { entityTypeParamHandler } from './entityParamMiddleware.js'
import { csrfProtection } from '../../../middlewares/security.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'

const router = Router()

// Register param handler for entityType parameter
// LEARNING: router.param() must be registered on the router that defines routes with :entityType
// WHY: Express param callbacks only fire for params on routes defined on that specific router
router.param('entityType', entityTypeParamHandler)

/**
 * PATCH /entities/:entityType/order_index
 * Bulk update order indices for entities
 * 
 * LEARNING: Bulk update order indices for efficient reordering
 * WHY: More efficient than individual PATCH requests (1 request vs N requests)
 * PATTERN: Transform payload, bulk update, return count
 */
router.patch('/:entityType/order_index', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }
  
  try {
    // PATTERN: Client sends camelCase (orderIndex); Sequelize model uses underscored: true
    const updatedCount = await bulkPatch(entityConfig.model, req.body)
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
router.patch('/:entityType/bulk', csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const { entityConfig } = req
  if (!entityConfig) {
    res.status(500).json({ error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING })
    return
  }

  try {
    const updates = req.body

    const validation = validateBulkUpdateArray(updates)
    if (!validation.valid) {
      res.status(400).json({
        error: validation.error,
        ...validation.details
      })
      return
    }

    const entityType = req.params.entityType
    const isBlockInstance = entityType === ENTITY_KEYS.BLOCK_INSTANCE
    if (isBlockInstance) {
      await ensureBlockInstanceVersionsBeforeBulkUpdate(updates)
    }

    const updatedCount = await bulkPatch(entityConfig.model, updates)
    res.json({ updated: updatedCount })
  } catch (error) {
    const errorMessage = ERROR_MESSAGES.BULK_UPDATE_FAILED.replace('{displayName}', entityConfig.displayName)
    handleRouteError(error, res, errorMessage, entityConfig.displayName, 'bulk updating entities')
  }
})

export { router as EntityBulkRouter }
