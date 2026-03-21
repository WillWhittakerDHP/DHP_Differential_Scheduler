
/** Fallback when error type is unknown (re-export from shared). */
export { UNKNOWN_ERROR_MESSAGE } from '@shared/constants/errorMessages'

export const ERROR_FETCH_OAUTH_STATUS = 'Failed to fetch OAuth status'

export const ERROR_FETCH_EVENTS_CACHE = 'Failed to fetch events cache'

export const ERROR_FETCH_RATE_LIMIT_BOTH = 'Failed to fetch rate limit stats for both APIs'

export const ERROR_FETCH_RATE_LIMIT = 'Failed to fetch rate limit stats'

export const ERROR_FETCH_DRIVE_TIME_CACHE = 'Failed to fetch drive time cache'

export const ERROR_FETCH_DEV_STATUS = 'Failed to fetch dev status'

/** Appointment and business settings error messages (re-export from shared). */
export {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
  ERROR_FETCH_BUSINESS_SETTINGS,
} from '@shared/constants/errorMessages'
