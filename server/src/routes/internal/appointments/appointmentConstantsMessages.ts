
import {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
} from '../../../../../shared/constants/errorMessages.js'

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

const ADMIN_DEV_TESTING_EMAIL = 'scheduling@districthomepro.com'

export const DEFAULT_CALENDAR_EMAIL = ADMIN_DEV_TESTING_EMAIL

export const STATUSES_REQUIRING_CALENDAR_EVENT = ['submitted', 'confirmed'] as const

export const ALLOWED_OVERRIDE_CONSTRAINTS = ['capacity', 'buffer', 'blackout', 'businessHours'] as const
export type OverrideConstraintKey = (typeof ALLOWED_OVERRIDE_CONSTRAINTS)[number]

export const CONSTRAINT_OVERRIDE_FIELDS = { APPOINTMENT_ID: 'appointmentId' } as const
