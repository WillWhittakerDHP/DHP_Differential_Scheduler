/**
 * Google Calendar API Constants
 *
 * LEARNING: Centralized constants for Google Calendar API operations
 * WHY: Single source of truth for Calendar API constants, eliminates magic strings
 * PATTERN: Constants module (matches Maps pattern from mapsConstants.ts)
 */

import { OAUTH_ERROR_MESSAGES } from '../../../constants/appConstants.js'
import {
  DEFAULT_RETRY_CONFIG,
  type RetryConfig
} from '../shared/googleApiRetry.js'

/**
 * Default send updates value for event creation
 * LEARNING: Default to sending invitation emails
 */
export const DEFAULT_SEND_UPDATES: 'all' | 'externalOnly' | 'none' = 'all'

/**
 * Maximum results for calendar events list API
 * LEARNING: Google Calendar API limit
 */
export const MAX_EVENTS_RESULTS = 2500

/**
 * Retry configuration for Calendar API operations
 * LEARNING: Reuses shared Google API retry config (matches Maps pattern)
 */
export const CALENDAR_RETRY_CONFIG: RetryConfig = DEFAULT_RETRY_CONFIG

/**
 * User-friendly error messages for each Calendar API error type
 * LEARNING: Single source of truth for user-facing messages
 * WHY: Eliminates magic strings in getUserMessage, improves maintainability
 */
export const CALENDAR_ERROR_MESSAGES = {
  auth: 'Calendar authentication failed. Please reconnect your Google Calendar.',
  permission: 'Calendar access denied. Please check calendar permissions.',
  rateLimit: 'Too many calendar requests. Please try again in a moment.',
  notFound: 'Calendar not found or not accessible.',
  network: 'Could not reach Google Calendar service. Please check your connection.',
  timeout: 'Calendar request timed out. Please try again.',
  invalid: 'Invalid calendar request or response.',
  unknown: 'An unexpected calendar error occurred.',
} as const

/**
 * Maps CalendarErrorType to HTTP status code
 * LEARNING: Consistent status codes for route error responses
 */
export const CALENDAR_ERROR_TO_STATUS = {
  auth: 401,
  permission: 403,
  rateLimit: 429,
  notFound: 404,
  network: 503,
  timeout: 503,
  invalid: 400,
  unknown: 500,
} as const

/**
 * Maps HTTP status codes to error classification (for classifyError)
 * LEARNING: Lookup table replaces nested if/else chain
 * WHY: Reduces function complexity, single source of truth
 */
export const CALENDAR_STATUS_MAP: Record<
  number,
  { type: keyof typeof CALENDAR_ERROR_MESSAGES; retryable: boolean; message: string }
> = {
  401: { type: 'auth', retryable: false, message: OAUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED },
  404: { type: 'notFound', retryable: false, message: 'Resource not found' },
  429: { type: 'rateLimit', retryable: true, message: 'Rate limit exceeded' },
}

/**
 * Network error codes from Node.js (no HTTP response received)
 * LEARNING: Single source of truth for network error detection
 */
export const NETWORK_ERROR_CODES = new Set<string>([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
])

/**
 * Keywords in error message indicating rate limit (vs permission denied)
 * LEARNING: 403 can mean either; distinguish via message content
 */
export const RATE_LIMIT_KEYWORDS = ['rate', 'quota', 'limit'] as const

/**
 * Technical error messages (internal, not user-facing)
 * LEARNING: Consolidates strings; uses appConstants where shared
 */
export const CALENDAR_INTERNAL_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  PERMISSION_DENIED: 'Permission denied',
  REQUEST_TIMED_OUT: 'Request timed out',
  NETWORK_ERROR: (code: string) => `Network error: ${code}`,
  UNKNOWN: 'Unknown error',
} as const
