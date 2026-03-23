/**
 * Availability Database Utilities
 *
 * ============================================================================
 * ASYNCHRONOUS APPOINTMENT CREATION WORKFLOW SUPPORT
 * ============================================================================
 *
 * These functions support asynchronous appointment creation workflows where
 * appointments exist in the database with 'submitted' or 'confirmed' status
 * before being synced to Google Calendar. This ensures capacity limits are
 * enforced even when appointments haven't yet appeared in free-busy calendar data.
 *
 * APPOINTMENT STATUS WORKFLOW:
 * - 'started': Non-quote mode appointment creation in progress (NOT COUNTED)
 * - 'held': Time slots held for clients who paid booking fee (NOT COUNTED)
 * - 'rescheduling': Non-quote mode rescheduling in progress (NOT COUNTED)
 * - 'quoted': Quote mode appointment creation in progress (NOT COUNTED)
 * - 'submitted': Submitted through app, awaiting confirmation (COUNTED)
 * - 'confirmed': Submitted and confirmed (COUNTED)
 * - 'cancelled': Soft-delete, still reschedulable (NOT COUNTED)
 * - 'deleted': Hard-delete (NOT COUNTED)
 *
 * See: client/src/types/appointment.ts for AppointmentStatus union type definition
 *
 * SEPARATION OF CONCERNS:
 * - Free-busy checking: Uses Google Calendar API to check external calendar events
 * - Capacity checking: Uses database appointments (these functions) to check internal workflow state
 *
 * WHY BOTH ARE NEEDED:
 * - Free-busy blocks slots based on calendar events (external, already synced)
 * - Capacity blocks slots based on database appointments (internal, including pending/confirmed but not-yet-synced)
 *
 * STATUS FILTER LOGIC:
 * All functions in this module query database appointments directly (not calendar events)
 * and only count appointments with status 'submitted' or 'confirmed'. This ensures
 * capacity limits are enforced during the asynchronous workflow period before
 * Google Calendar sync.
 *
 * ============================================================================
 */

export {
  sumWorkHoursForDay,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  getCalendarWeekRange,
  getRollingWeekRange,
} from './availabilitiesDbSums.js'
export {
  sumIncomeForDay,
  sumIncomeForCalendarWeek,
  sumIncomeForRollingWeek,
} from './availabilitiesDbIncome.js'
