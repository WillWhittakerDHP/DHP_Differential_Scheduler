/**
 * Canonical appointment workflow status strings (DB ENUM + API).
 * Client union: client/src/types/appointmentStatus.ts — keep in sync when adding values.
 */
export const APPOINTMENT_STATUS_VALUES = [
  'started',
  'held',
  'rescheduling',
  'quoted',
  'submitted',
  'confirmed',
  'cancelled',
  'deleted',
] as const

export type AppointmentStatusLiteral = (typeof APPOINTMENT_STATUS_VALUES)[number]

export const APPOINTMENT_STATUS_STARTED: AppointmentStatusLiteral = 'started'
export const APPOINTMENT_STATUS_HELD: AppointmentStatusLiteral = 'held'
export const APPOINTMENT_STATUS_RESCHEDULING: AppointmentStatusLiteral = 'rescheduling'
export const APPOINTMENT_STATUS_QUOTED: AppointmentStatusLiteral = 'quoted'
export const APPOINTMENT_STATUS_SUBMITTED: AppointmentStatusLiteral = 'submitted'
export const APPOINTMENT_STATUS_CONFIRMED: AppointmentStatusLiteral = 'confirmed'
export const APPOINTMENT_STATUS_CANCELLED: AppointmentStatusLiteral = 'cancelled'
export const APPOINTMENT_STATUS_DELETED: AppointmentStatusLiteral = 'deleted' 