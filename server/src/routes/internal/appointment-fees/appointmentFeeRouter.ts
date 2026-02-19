/**
 * Appointment Fee Summary Router
 *
 * LEARNING: Read-only routes for appointment fee summaries (GET list, GET by id)
 * WHY: Fee records are created with appointments; this enables standalone querying for analytics
 * PATTERN: Mount CRUD router with mutations disabled
 */

import { Router } from 'express'
import { AppointmentFeeCrudRouter } from './appointmentFeeCrudRouter.js'

const router = Router()
router.use('/', AppointmentFeeCrudRouter)

export { router as AppointmentFeeRouter }
