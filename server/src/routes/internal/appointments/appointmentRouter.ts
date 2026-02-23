/**
 * Appointment Router - Main Orchestrator
 * 
 */

import { Router } from 'express'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'

const router = Router()

// Mount CRUD routes (includes versions endpoint)
router.use('/', AppointmentCrudRouter)

export { router as AppointmentRouter }

