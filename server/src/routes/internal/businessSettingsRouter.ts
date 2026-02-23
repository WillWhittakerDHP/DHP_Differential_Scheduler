/**
 * Business Settings Router - Main Orchestrator
 * 
 */

import { Router } from 'express'
import { BusinessSettingsCrudRouter } from './businessSettings/businessSettingsCrudRouter.js'

const router = Router()

router.use('/', BusinessSettingsCrudRouter)

export { router as BusinessSettingsRouter }

