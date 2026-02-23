/**
 * Relationship Router - Main Orchestrator
 * 
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

router.use('/', RelationshipBatchRouter)

router.use('/', RelationshipCrudRouter)

router.use('/instanceComponents', RelationshipInstanceComponentRouter)

router.use('/annotationAssignments', RelationshipAnnotationAssignmentRouter)

export { router as RelationshipRouter };
