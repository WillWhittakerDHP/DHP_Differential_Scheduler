/**
 * User Router - Main Orchestrator
 * 
 */

import { Router } from 'express'
import { UserCrudRouter } from './userCrudRouter.js'

const router = Router()

router.use('/', UserCrudRouter)

export { router as UserRouter }

