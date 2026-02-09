/**
 * Business Settings Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD operations
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 */

import { Router } from 'express'
import { BusinessSettingsCrudRouter } from './businessSettings/businessSettingsCrudRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', BusinessSettingsCrudRouter)

export { router as BusinessSettingsRouter }

