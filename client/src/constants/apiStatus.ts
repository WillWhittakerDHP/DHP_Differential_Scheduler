/**
 * API Status Constants
 * 
 */

/**
 * API status value: successful API call
 */
export const API_STATUS_HIT = 'hit' as const

/**
 * API status value: API call resulted in error
 */
export const API_STATUS_ERROR = 'error' as const

/**
 * API status value: API not called yet
 */
export const API_STATUS_NOT_CALLED = 'not_called' as const

/**
 * Vuetify color for success status
 */
export const API_STATUS_COLOR_SUCCESS = 'success' as const

/**
 * Vuetify color for error status
 */
export const API_STATUS_COLOR_ERROR = 'error' as const

/**
 * Vuetify color for default/not called status
 */
export const API_STATUS_COLOR_DEFAULT = 'default' as const

/**
 * Display label for hit status
 */
export const API_STATUS_LABEL_HIT = 'Hit' as const

/**
 * Display label for error status
 */
export const API_STATUS_LABEL_ERROR = 'Error' as const

/**
 * Display label for not called status
 */
export const API_STATUS_LABEL_NOT_CALLED = 'Not Called' as const

/**
 * Type for API status values
 */
export type ApiStatusValue = typeof API_STATUS_HIT | typeof API_STATUS_ERROR | typeof API_STATUS_NOT_CALLED

/**
 * Map API status to Vuetify color
 */
export const API_STATUS_COLOR_MAP: Record<ApiStatusValue, string> = {
  [API_STATUS_HIT]: API_STATUS_COLOR_SUCCESS,
  [API_STATUS_ERROR]: API_STATUS_COLOR_ERROR,
  [API_STATUS_NOT_CALLED]: API_STATUS_COLOR_DEFAULT,
}

/**
 * Map API status to display label
 */
export const API_STATUS_LABEL_MAP: Record<ApiStatusValue, string> = {
  [API_STATUS_HIT]: API_STATUS_LABEL_HIT,
  [API_STATUS_ERROR]: API_STATUS_LABEL_ERROR,
  [API_STATUS_NOT_CALLED]: API_STATUS_LABEL_NOT_CALLED,
}
