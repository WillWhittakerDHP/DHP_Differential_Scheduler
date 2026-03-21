/**
PATTERN: Constants module (matches Maps pa...
 */
import { OAUTH_ERROR_MESSAGES } from '../../../constants/appConstants.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../../../../shared/constants/errorMessages.js'
import {
  DEFAULT_RETRY_CONFIG,
  type RetryConfig
} from '../shared/googleApiRetry.js'

export const DEFAULT_SEND_UPDATES: 'all' | 'externalOnly' | 'none' = 'all'

export const MAX_EVENTS_RESULTS = 2500

export const CALENDAR_RETRY_CONFIG: RetryConfig = DEFAULT_RETRY_CONFIG

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

export const CALENDAR_STATUS_MAP: Record<
  number,
  { type: keyof typeof CALENDAR_ERROR_MESSAGES; retryable: boolean; message: string }
> = {
  401: { type: 'auth', retryable: false, message: OAUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED },
  404: { type: 'notFound', retryable: false, message: 'Resource not found' },
  429: { type: 'rateLimit', retryable: true, message: 'Rate limit exceeded' },
}

export const NETWORK_ERROR_CODES = new Set<string>([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
])

export const RATE_LIMIT_KEYWORDS = ['rate', 'quota', 'limit'] as const

export const CALENDAR_INTERNAL_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  PERMISSION_DENIED: 'Permission denied',
  REQUEST_TIMED_OUT: 'Request timed out',
  NETWORK_ERROR: (code: string) => `Network error: ${code}`,
  UNKNOWN: UNKNOWN_ERROR_MESSAGE,
} as const
