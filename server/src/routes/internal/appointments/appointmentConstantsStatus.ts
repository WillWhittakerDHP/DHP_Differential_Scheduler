
export type AppointmentStatus =
  | 'started'
  | 'held'
  | 'rescheduling'
  | 'quoted'
  | 'submitted'
  | 'confirmed'
  | 'cancelled'
  | 'deleted'

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

export function isValidTransition(
  fromStatus: AppointmentStatus,
  toStatus: AppointmentStatus,
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[fromStatus]
  return allowed.includes(toStatus)
}
