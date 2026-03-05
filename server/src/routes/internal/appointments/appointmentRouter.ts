import { Router } from 'express'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'
import { forceCreateRouter } from './forceCreateRouter.js'
import { listForAdminEntryHandler } from './listForAdminEntryHandler.js'

const router = Router()

router.get('/list-for-admin-entry', listForAdminEntryHandler)
router.use('/', AppointmentCrudRouter)
router.use('/force-create', forceCreateRouter)

export { router as AppointmentRouter }

