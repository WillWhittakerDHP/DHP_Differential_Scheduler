/** Fallback when error type is unknown (re-export from shared). */
export { UNKNOWN_ERROR_MESSAGE } from '@shared/constants/errorMessages'

export { RELATIONSHIP_ALREADY_EXISTS } from './relationshipErrorConstants'

export * from './errorMessagesFetch'

/** Appointment and business settings error messages (re-export from shared). */
export {
  APPOINTMENT_NOT_FOUND,
  ERROR_CREATE_APPOINTMENT,
  ERROR_UPDATE_APPOINTMENT,
  ERROR_FETCH_BUSINESS_SETTINGS,
} from '@shared/constants/errorMessages'
