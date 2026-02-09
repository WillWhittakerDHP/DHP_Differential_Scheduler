/**
 * Availability Router Constants
 * 
 * LEARNING: Centralized constants for availability router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Error messages for availability operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values
 */
export const ERROR_MESSAGES = {
  COMPUTE_FAILED: 'Failed to compute availability data',
  INVALID_DATE_RANGE: 'dateRange.start and dateRange.end are required',
  INVALID_DURATION: 'duration must be a positive number',
} as const
