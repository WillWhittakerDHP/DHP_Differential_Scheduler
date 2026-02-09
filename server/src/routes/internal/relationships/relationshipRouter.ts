/**
 * Relationship Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD operations and special endpoints
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers with param middleware
 */

import { Router, Request, Response } from 'express'
import { RelationshipCrudRouter } from './relationshipCrudRouter.js'
import { RelationshipInstanceComponentRouter } from './relationshipInstanceComponentRouter.js'
import { RelationshipAnnotationAssignmentRouter } from './relationshipAnnotationAssignmentRouter.js'
import { RELATIONSHIP_REGISTRY, type RelationshipConfig } from './relationshipConstants.js'
import { isValidRelationshipKind, normalizeRelationshipKind } from './relationshipValidators.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

// Declare global Express Request type extension for relationshipConfig
declare global {
  namespace Express {
    interface Request {
      relationshipConfig?: RelationshipConfig
    }
  }
}

/**
 * Middleware: Validate relationship kind and attach configuration
 * 
 * LEARNING: Route parameter name differs from internal concept
 * WHY: URL structure stability is important - changing route params breaks existing clients
 * PATTERN: Route param name (:relationshipType) can differ from internal concept (relationshipKind)
 * NOTE: Route param uses "relationshipType" for URL stability, but internally we use "relationshipKind" for clarity
 */
router.param('relationshipType', (req, res, next, relationshipType) => {
  if (!isValidRelationshipKind(relationshipType)) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
      error: `Unknown relationship kind: ${relationshipType}`,
      validKinds: Object.keys(RELATIONSHIP_REGISTRY)
    })
  }
  
  const normalizedKind = normalizeRelationshipKind(relationshipType)
  req.relationshipConfig = RELATIONSHIP_REGISTRY[normalizedKind]
  next()
})

// Mount CRUD routes (includes GET, POST, DELETE for all relationship types)
router.use('/', RelationshipCrudRouter)

// Mount special instance component routes (PATCH, DELETE by ID)
router.use('/instanceComponents', RelationshipInstanceComponentRouter)

// Mount special annotation assignment routes (PATCH by blockInstanceId/annotationId)
router.use('/annotationAssignments', RelationshipAnnotationAssignmentRouter)

export { router as RelationshipRouter };
