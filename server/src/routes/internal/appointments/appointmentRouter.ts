import { Router } from 'express'
import {
  USER_ROLE_ADMIN,
  USER_ROLE_AGENT,
  USER_ROLE_OWNER,
  USER_ROLE_TRANSACTION_MANAGER,
} from '../../../constants/userRoles.js'
import { requireAuth, requireRole } from '../../../middlewares/security.js'
import { AppointmentCrudRouter } from './appointmentCrudRouter.js'
import { forceCreateRouter } from './forceCreateRouter.js'
import { listForAdminEntryHandler } from './listForAdminEntryHandler.js'

const router = Router()

/** WHY: Admin-only list — must not be world-readable (GC-7-E1 / task 7.4.4.2). Align roles with internal staff + admin usage (see forceCreateRouter). */
router.get(
  '/list-for-admin-entry',
  requireAuth,
  requireRole(
    USER_ROLE_AGENT,
    USER_ROLE_TRANSACTION_MANAGER,
    USER_ROLE_OWNER,
    USER_ROLE_ADMIN
  ),
  listForAdminEntryHandler
)
router.use('/', AppointmentCrudRouter)
router.use('/force-create', forceCreateRouter)

export { router as AppointmentRouter }

