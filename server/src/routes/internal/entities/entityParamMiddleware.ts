/**
 * Entity Type Parameter Middleware
 * 
 * LEARNING: Shared param handler for entity type validation and configuration attachment
 * WHY: Express router.param() only fires on the router where the param is defined, not on mounted sub-routers
 * PATTERN: Extract param handler to shared function, register on each sub-router that uses :entityType
 */

import { Request, Response, NextFunction } from 'express'
import { getEntityConfig, isValidEntityType } from '../../../config/entityRegistry.js'
import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('EntityRouter')

/**
 * Entity type parameter handler
 * LEARNING: Validates entity type and attaches entityConfig to request
 * WHY: Provides entity configuration to route handlers
 * PATTERN: Express param middleware that validates and enriches request
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @param entityType - Entity type from route parameter
 */
export function entityTypeParamHandler(
  req: Request, res: Response, next: NextFunction, entityType: string
): void {
  if (!isValidEntityType(entityType)) {
    res.status(404).json({ 
      error: ERROR_MESSAGES.UNKNOWN_ENTITY_KIND.replace('{entityType}', entityType),
      validKinds: ENTITY_KEYS_ARRAY
    })
    return
  }
  
  try {
    req.entityConfig = getEntityConfig(entityType)
    next()
  } catch (error) {
    logger.error('Configuration error:', error)
    res.status(500).json({ error: ERROR_MESSAGES.CONFIGURATION_ERROR })
  }
}
