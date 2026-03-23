import { APPOINTMENT_STATUS_VALUES } from '@shared/constants/appointmentStatusLiterals'
import type { AppointmentStatus } from '@/types/appointmentStatus'

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [...APPOINTMENT_STATUS_VALUES]

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

/** Mirrors server `isValidTransition` — used when building save payloads for loaded appointments. */
export function isValidTransition(fromStatus: AppointmentStatus, toStatus: AppointmentStatus): boolean {
  return (VALID_STATUS_TRANSITIONS[fromStatus] as readonly AppointmentStatus[]).includes(toStatus)
}
