/**
 * Shared Error Message Constants
 *
 * LEARNING: Single source of truth for common error strings used by client and server
 * WHY: Eliminates duplicate "Unknown error" definitions in client/constants/errorMessages.ts
 *      and server/constants/router.ts; one definition, both sides re-export
 * PATTERN: Exported const for fallback when error type cannot be determined
 *
 * Phase: P0 Constants Consolidation Refactor
 */

/** Fallback message when error type cannot be determined */
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error' as const

/** Generic message shown to clients when in production to avoid leaking details */
export const INTERNAL_SERVER_ERROR = 'Internal server error' as const

/** Appointment not found (client and server) */
export const APPOINTMENT_NOT_FOUND = 'Appointment not found' as const

/** Failed to create appointment (client and server) */
export const ERROR_CREATE_APPOINTMENT = 'Failed to create appointment' as const

/** Failed to update appointment (client and server) */
export const ERROR_UPDATE_APPOINTMENT = 'Failed to update appointment' as const

/** Failed to fetch business settings (client and server) */
export const ERROR_FETCH_BUSINESS_SETTINGS = 'Failed to fetch business settings' as const
