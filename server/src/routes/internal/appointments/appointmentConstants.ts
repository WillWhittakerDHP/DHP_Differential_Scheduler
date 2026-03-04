
import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'
import {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
} from '../../../../../shared/constants/errorMessages.js'

export { AVAILABILITY_SETTINGS_KEY }

export type AppointmentStatus =
  | 'started'
  | 'held'
  | 'rescheduling'
  | 'quoted'
  | 'submitted'
  | 'confirmed'
  | 'cancelled'
  | 'deleted'

/**
 * State machine: allowed status transitions.
 * Each key maps to the set of statuses it can transition to.
 * `deleted` is a terminal state with no valid outgoing transitions.
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

export function isValidTransition(
  fromStatus: AppointmentStatus,
  toStatus: AppointmentStatus,
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[fromStatus]
  return allowed.includes(toStatus)
}

export const ERROR_MESSAGES = {
  FETCH_APPOINTMENTS: 'Failed to fetch appointments',
  FETCH_APPOINTMENT: 'Error fetching appointment',
  APPOINTMENT_NOT_FOUND,
  CREATE_APPOINTMENT: ERROR_CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT: ERROR_UPDATE_APPOINTMENT,
  PATCH_APPOINTMENT: 'Failed to patch appointment',
  DELETE_APPOINTMENT: 'Failed to delete appointment',
  FETCH_APPOINTMENT_VERSIONS: 'Error fetching appointment versions',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  INVALID_SNAPSHOT_IDS: 'One or more snapshot IDs are invalid',
} as const

/**
 * Admin panel dev testing email. Used as default calendar account and as the
 * mailbox for Gmail MCP invite-response verification (see .cursor/GMAIL_MCP_SETUP.md).
 */
export const ADMIN_DEV_TESTING_EMAIL = 'scheduling@districthomepro.com'

/** Default calendar when no writeTo calendar is configured; same as admin dev testing email. */
export const DEFAULT_CALENDAR_EMAIL = ADMIN_DEV_TESTING_EMAIL

export const STATUSES_REQUIRING_CALENDAR_EVENT = ['submitted', 'confirmed'] as const
export type AppointmentStatusRequiringCalendarEvent = (typeof STATUSES_REQUIRING_CALENDAR_EVENT)[number]

/**
 * Constraint keys that admins can override when scheduling appointments.
 * Each key corresponds to a check in the slot computation pipeline.
 * Phase 6.7 will wire these into the actual constraint engine.
 */
export const ALLOWED_OVERRIDE_CONSTRAINTS = ['capacity', 'buffer', 'blackout', 'businessHours'] as const
export type OverrideConstraintKey = (typeof ALLOWED_OVERRIDE_CONSTRAINTS)[number]
