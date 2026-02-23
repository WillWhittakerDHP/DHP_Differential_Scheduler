
import { Router } from 'express'
import { AppointmentFeeCrudRouter } from './appointmentFeeCrudRouter.js'

const router = Router()
router.use('/', AppointmentFeeCrudRouter)

export { router as AppointmentFeeRouter }
