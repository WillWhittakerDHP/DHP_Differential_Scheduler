
import { Router } from 'express'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'

const router = Router()

router.use('/', AppointmentCrudRouter)

export { router as AppointmentRouter }

