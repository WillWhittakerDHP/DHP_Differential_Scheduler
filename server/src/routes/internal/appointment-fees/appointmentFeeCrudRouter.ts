/**
 * WHY: Appointment Fee Summary CRUD Router (read-only)
LEARNING: Fee summaries ...
 */
import { AppointmentFeeSummary, AppointmentFeeEntry } from '../../../config/app.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { FEE_ERROR_MESSAGES } from './appointmentFeeConstants.js'

const router = createCrudRouter({
  model: AppointmentFeeSummary,
  resourceName: 'appointmentFeeSummary',
  errorMessages: FEE_ERROR_MESSAGES,
  defaultIncludes: [{ model: AppointmentFeeEntry, as: 'feeEntries' }],
  enablePost: false,
  enablePut: false,
  enablePatch: false,
  enableDelete: false,
})

export { router as AppointmentFeeCrudRouter }
