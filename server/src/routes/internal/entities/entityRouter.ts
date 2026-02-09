/**
 * Entity Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD, bulk operations, and config endpoints
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers and provides param middleware
 */

import { Router, Request, Response } from 'express'
import { getEntityConfig, isValidEntityType } from '../../../config/entityRegistry.js'
import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'
import { EntityCrudRouter } from './entityCrudRouter.js'
import { EntityBulkRouter } from './entityBulkRouter.js'
import { EntityConfigRouter } from './entityConfigRouter.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('EntityRouter')

const router = Router()

/**
 * Middleware: Validate entity kind and attach configuration to request
 * 
 * LEARNING: Route parameter name differs from internal concept
 * WHY: URL structure stability is important - changing route params breaks existing clients
 * PATTERN: Route param name (:entityType) can differ from internal concept (entityKind)
 * NOTE: Route param uses "entityType" for URL stability, but internally we use "entityKind" for clarity
 */
router.param('entityType', (req, res, next, entityType) => {
  if (!isValidEntityType(entityType)) {
    // PATTERN: Use constant array from entities.ts
    return res.status(404).json({ 
      error: ERROR_MESSAGES.UNKNOWN_ENTITY_KIND.replace('{entityType}', entityType),
      validKinds: ENTITY_KEYS_ARRAY
    })
  }
  
  try {
    req.entityConfig = getEntityConfig(entityType)
    next()
  } catch (error) {
    logger.error('Configuration error:', error)
    return res.status(500).json({ error: ERROR_MESSAGES.CONFIGURATION_ERROR })
  }
})

// Mount config router (before param middleware to avoid entityType requirement)
router.use('/', EntityConfigRouter)

// Mount CRUD routes
router.use('/', EntityCrudRouter)

// Mount bulk operations routes
router.use('/', EntityBulkRouter)

export { router as EntityRouter }
