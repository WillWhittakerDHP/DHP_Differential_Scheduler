import { Router } from 'express'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'
import { forceCreateRouter } from './forceCreateRouter.js'

const router = Router()

router.use('/', AppointmentCrudRouter)
router.use('/force-create', forceCreateRouter)

export { router as AppointmentRouter }

