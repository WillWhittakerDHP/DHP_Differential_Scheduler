/**
 * Property Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD and property types operations
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 */

import { Router } from 'express'
import { PropertyCrudRouter } from './propertyCrudRouter.js'
import { PropertyTypesRouter } from './propertyTypesRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', PropertyCrudRouter)

// Mount property types routes
router.use('/', PropertyTypesRouter)

export { router as PropertyRouter }
