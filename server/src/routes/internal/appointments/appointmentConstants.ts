
import { AVAILABILITY_SETTINGS_KEY } from '../../../constants/appConstants.js'
import {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
} from '../../../../../shared/constants/errorMessages.js'

export { AVAILABILITY_SETTINGS_KEY }

export const ERROR_MESSAGES = {
  FETCH_APPOINTMENTS: 'Failed to fetch appointments',
  FETCH_APPOINTMENT: 'Error fetching appointment',
  APPOINTMENT_NOT_FOUND,
  CREATE_APPOINTMENT: ERROR_CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT: ERROR_UPDATE_APPOINTMENT,
  PATCH_APPOINTMENT: 'Failed to patch appointment',
  DELETE_APPOINTMENT: 'Failed to delete appointment',
  FETCH_APPOINTMENT_VERSIONS: 'Error fetching appointment versions',
  
  INVALID_SNAPSHOT_IDS: 'One or more snapshot IDs are invalid',
} as const

export const DEFAULT_CALENDAR_EMAIL = 'scheduling@districthomepro.com'

export const STATUSES_REQUIRING_CALENDAR_EVENT = ['submitted', 'confirmed'] as const
export type AppointmentStatusRequiringCalendarEvent = (typeof STATUSES_REQUIRING_CALENDAR_EVENT)[number]
