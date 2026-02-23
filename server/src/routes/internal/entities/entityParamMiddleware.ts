/**
 * Entity Type Parameter Middleware
 * 
 */

import { Request, Response, NextFunction } from 'express'
import { getEntityConfig, isValidEntityType } from '../../../config/entityRegistry.js'
import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('EntityRouter')

/**
 * PATTERN: Entity type parameter handler
PATTERN: Express param middleware that val...
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
