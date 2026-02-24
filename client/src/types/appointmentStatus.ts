/**
 * Appointment status workflow type and constants.
 * WHY: Shared by appointment.ts and appointmentApi.ts to avoid circular dependency.
 * See docs/appointment-status-workflow.md for future implementation notes.
 */

export type AppointmentStatus =
  | 'started'
  | 'held'
  | 'rescheduling'
  | 'quoted'
  | 'submitted'
  | 'confirmed'
  | 'cancelled'
  | 'deleted'

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'started',
  'held',
  'rescheduling',
  'quoted',
  'submitted',
  'confirmed',
  'cancelled',
  'deleted',
]

/**
 * State machine: allowed status transitions (mirrors server-side VALID_STATUS_TRANSITIONS).
 * Used client-side for filtering status dropdowns to only show valid next-statuses.
 */
export const VALID_STATUS_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  started:      ['quoted', 'submitted', 'cancelled', 'deleted'],
  held:         ['started', 'submitted', 'cancelled'],
  rescheduling: ['submitted', 'cancelled'],
  quoted:       ['submitted', 'cancelled', 'deleted'],
  submitted:    ['confirmed', 'rescheduling', 'cancelled'],
  confirmed:    ['rescheduling', 'cancelled'],
  cancelled:    ['deleted'],
  deleted:      [],
} as const

export function getValidNextStatuses(currentStatus: AppointmentStatus): AppointmentStatus[] {
  return [...VALID_STATUS_TRANSITIONS[currentStatus]]
}
