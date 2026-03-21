/**
 * Appointment status workflow type.
 * WHY: Shared by appointment.ts and appointmentApi.ts to avoid circular dependency.
 * Runtime constants and helpers live in constants/appointmentStatus.ts.
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
