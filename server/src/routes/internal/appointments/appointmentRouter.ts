/**
 * Appointment Router - Main Orchestrator
 * 
 * LEARNING: Main router that combines CRUD operations and version endpoints
 * WHY: Separates concerns into focused modules while maintaining single router export
 * PATTERN: Express router that mounts sub-routers
 */

import { Router } from 'express'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'

const router = Router()

// Mount CRUD routes (includes versions endpoint)
router.use('/', AppointmentCrudRouter)

export { router as AppointmentRouter }

