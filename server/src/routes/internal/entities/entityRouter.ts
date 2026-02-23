/**
 * Entity Router - Main Orchestrator
 * 
 * 
 * NOTE: Entity type param validation is handled by entityParamMiddleware.ts and registered
 * on EntityCrudRouter and EntityBulkRouter directly, since router.param() only fires for
 * params on routes defined on that specific router, not on mounted sub-routers.
 */

import { Router } from 'express'
import { EntityBatchRouter } from './entityBatchRouter.js'
import { EntityCrudRouter } from './entityCrudRouter.js'
import { EntityBulkRouter } from './entityBulkRouter.js'
import { EntityConfigRouter } from './entityConfigRouter.js'

const router = Router()

// Mount config router (no entityType param required)
router.use('/', EntityConfigRouter)

router.use('/', EntityBatchRouter)

// Mount bulk operations BEFORE CRUD so PATCH /:entityType/order_index is matched literally
// (not as CRUD PATCH /:entityType/:id with id = 'order_index')
router.use('/', EntityBulkRouter)

router.use('/', EntityCrudRouter)

export { router as EntityRouter }
