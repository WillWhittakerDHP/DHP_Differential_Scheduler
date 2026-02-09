/**
 * Entity Config Router
 * 
 * LEARNING: Extracted config endpoint for entities
 * WHY: Separates config operations from CRUD operations, improves maintainability
 * PATTERN: Express router with config endpoint
 */

import { Router, Request, Response } from 'express'
import { ENTITY_KEYS_ARRAY } from './entityConstants.js'
import { ERROR_MESSAGES, DEFAULT_VALUES } from './entityConstants.js'
import { handleRouteError } from './entityErrorHandler.js'

const router = Router()

/**
 * GET /entities/config
 * Get entity configuration
 * 
 * LEARNING: Returns entity keys and configuration metadata
 * WHY: Provides client with available entity types and version info
 * PATTERN: Return entity keys array with version metadata
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      entityKeys: ENTITY_KEYS_ARRAY,
      version: DEFAULT_VALUES.CONFIG_VERSION,
      lastModified: new Date().toISOString()
    })
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_CONFIG, 'entity configuration', 'fetching config')
  }
})

export { router as EntityConfigRouter }
