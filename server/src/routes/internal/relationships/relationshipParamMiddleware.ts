/**
 * Relationship Type Parameter Middleware
 * 
 * LEARNING: Shared param handler for relationship type validation and configuration attachment
 * WHY: Express router.param() only fires on the router where the param is defined, not on mounted sub-routers
 * PATTERN: Extract param handler to shared function, register on each sub-router that uses :relationshipType
 */

import { Request, Response, NextFunction } from 'express'
import { RELATIONSHIP_REGISTRY } from './relationshipConstants.js'
import { isValidRelationshipKind, normalizeRelationshipKind } from './relationshipValidators.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

/**
 * Relationship type parameter handler
 * LEARNING: Validates relationship type and attaches relationshipConfig to request
 * WHY: Provides relationship configuration to route handlers
 * PATTERN: Express param middleware that validates and enriches request
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @param relationshipType - Relationship type from route parameter
 */
export function relationshipTypeParamHandler(
  req: Request, res: Response, next: NextFunction, relationshipType: string
): void {
  if (!isValidRelationshipKind(relationshipType)) {
    res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
      error: `Unknown relationship kind: ${relationshipType}`,
      validKinds: Object.keys(RELATIONSHIP_REGISTRY)
    })
    return
  }
  
  const normalizedKind = normalizeRelationshipKind(relationshipType)
  req.relationshipConfig = RELATIONSHIP_REGISTRY[normalizedKind]
  next()
}
