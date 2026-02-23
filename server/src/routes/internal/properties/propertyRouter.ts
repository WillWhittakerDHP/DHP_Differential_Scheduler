/**
 * Property Router - Main Orchestrator
 * 
 */

import { Router } from 'express'
import { PropertyCrudRouter } from './propertyCrudRouter.js'
import { PropertyTypesRouter } from './propertyTypesRouter.js'

const router = Router()

router.use('/', PropertyCrudRouter)

router.use('/', PropertyTypesRouter)

export { router as PropertyRouter }
