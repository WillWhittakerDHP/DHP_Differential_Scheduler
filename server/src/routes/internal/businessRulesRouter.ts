/**
 * Business Rules Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD operations
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 */

import { Router } from 'express'
import { BusinessRulesCrudRouter } from './businessRulesCrudRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', BusinessRulesCrudRouter)

export default router
