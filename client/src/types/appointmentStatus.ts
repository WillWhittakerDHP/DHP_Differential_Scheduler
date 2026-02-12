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
