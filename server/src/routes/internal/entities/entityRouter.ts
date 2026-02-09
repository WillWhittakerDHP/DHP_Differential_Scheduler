/**
 * Entity Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD, bulk operations, and config endpoints
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 * 
 * NOTE: Entity type param validation is handled by entityParamMiddleware.ts and registered
 * on EntityCrudRouter and EntityBulkRouter directly, since router.param() only fires for
 * params on routes defined on that specific router, not on mounted sub-routers.
 */

import { Router } from 'express'
import { EntityCrudRouter } from './entityCrudRouter.js'
import { EntityBulkRouter } from './entityBulkRouter.js'
import { EntityConfigRouter } from './entityConfigRouter.js'

const router = Router()

// Mount config router (no entityType param required)
router.use('/', EntityConfigRouter)

// Mount CRUD routes (entityType param handler registered in EntityCrudRouter)
router.use('/', EntityCrudRouter)

// Mount bulk operations routes (entityType param handler registered in EntityBulkRouter)
router.use('/', EntityBulkRouter)

export { router as EntityRouter }
