/**
 * Relationship Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD operations and special endpoints
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 * 
 * NOTE: Relationship type param validation is handled by relationshipParamMiddleware.ts and registered
 * on RelationshipCrudRouter directly, since router.param() only fires for params on routes defined
 * on that specific router, not on mounted sub-routers.
 */

import { Router } from 'express'
import { RelationshipBatchRouter } from './relationshipBatchRouter.js'
import { RelationshipCrudRouter } from './relationshipCrudRouter.js'
import { RelationshipInstanceComponentRouter } from './relationshipInstanceComponentRouter.js'
import { RelationshipAnnotationAssignmentRouter } from './relationshipAnnotationAssignmentRouter.js'

const router = Router()

// Mount batch router BEFORE CRUD routes to avoid :relationshipType param conflict
// WHY: /batch route must be registered before /:relationshipType route
// PATTERN: More specific routes (batch) before parameterized routes (relationshipType)
router.use('/', RelationshipBatchRouter)

// Mount CRUD routes (relationshipType param handler registered in RelationshipCrudRouter)
router.use('/', RelationshipCrudRouter)

// Mount special instance component routes (PATCH, DELETE by ID)
router.use('/instanceComponents', RelationshipInstanceComponentRouter)

// Mount special annotation assignment routes (PATCH by blockInstanceId/annotationId)
router.use('/annotationAssignments', RelationshipAnnotationAssignmentRouter)

export { router as RelationshipRouter };
