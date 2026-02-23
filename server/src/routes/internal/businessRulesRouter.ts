/**
 * Business Rules Router - Main Orchestrator
 * 
 */

import { Router } from 'express'
import { BusinessRulesCrudRouter } from './businessRulesCrudRouter.js'

const router = Router()

router.use('/', BusinessRulesCrudRouter)

export default router
