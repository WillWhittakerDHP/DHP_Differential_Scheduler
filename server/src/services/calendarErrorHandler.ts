
import { createLogger } from '../utils/logger.js'
import { withRetry as sharedWithRetry, type RetryConfig } from './google/shared/googleApiRetry.js'
import {
  CALENDAR_ERROR_MESSAGES,
  CALENDAR_ERROR_TO_STATUS,
  CALENDAR_STATUS_MAP,
  CALENDAR_INTERNAL_MESSAGES,
  CALENDAR_RETRY_CONFIG,
  NETWORK_ERROR_CODES,
  RATE_LIMIT_KEYWORDS,
} from './google/calendar/calendarConstants.js'

const logger = createLogger('CalendarErrorHandler')

type CalendarErrorType = keyof typeof CALENDAR_ERROR_MESSAGES

export class CalendarApiError extends Error {
  public readonly type: CalendarErrorType
  public readonly statusCode?: number
  public readonly retryable: boolean
  public readonly originalError?: Error

  constructor(
    type: CalendarErrorType,
    message: string,
    options?: {
      statusCode?: number
      retryable?: boolean
      originalError?: Error
    }
  ) {
    super(message)
    this.name = 'CalendarApiError'
    this.type = type
    this.statusCode = options?.statusCode
    this.retryable = options?.retryable ?? false
    this.originalError = options?.originalError

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalendarApiError)
    }
  }

  getUserMessage(): string {
    return CALENDAR_ERROR_MESSAGES[this.type]
  }

  getStatusCode(): number {
    return CALENDAR_ERROR_TO_STATUS[this.type] ?? 500
  }
}

function _getStatusCodeForError(errorType: CalendarErrorType): number {
  return CALENDAR_ERROR_TO_STATUS[errorType] ?? 500
}

function isRateLimitError(message: string): boolean {
  const lower = message.toLowerCase()
  return RATE_LIMIT_KEYWORDS.some((kw) => lower.includes(kw))
}

function toHttpStatus(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? undefined : n
  }
  return undefined
}

type CalendarErrShape = {
  code?: string
  message?: string
  status?: number
  response?: { status?: number }
}

function classifyNetworkCalendarError(err: CalendarErrShape): CalendarApiError | null {
  if (!err.code || !NETWORK_ERROR_CODES.has(err.code)) {
    return null
  }
  return new CalendarApiError('network', CALENDAR_INTERNAL_MESSAGES.NETWORK_ERROR(err.code), {
    retryable: true,
    originalError: err as Error,
  })
}

function classifyTimeoutCalendarError(err: CalendarErrShape): CalendarApiError | null {
  const timedOut =
    err.code === 'ETIMEDOUT' ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'))
  if (!timedOut) {
    return null
  }
  return new CalendarApiError('timeout', CALENDAR_INTERNAL_MESSAGES.REQUEST_TIMED_OUT, {
    retryable: true,
    originalError: err as Error,
  })
}

function classifyForbiddenCalendarError(err: CalendarErrShape, statusCode: number | undefined): CalendarApiError | null {
  if (statusCode !== 403) {
    return null
  }
  const message = typeof err.message === 'string' ? err.message : ''
  const type = isRateLimitError(message) ? 'rateLimit' : 'permission'
  const retryable = type === 'rateLimit'
  return new CalendarApiError(
    type,
    retryable ? CALENDAR_INTERNAL_MESSAGES.RATE_LIMIT_EXCEEDED : CALENDAR_INTERNAL_MESSAGES.PERMISSION_DENIED,
    {
      statusCode: 403,
      retryable,
      originalError: err as Error,
    }
  )
}

function classifyMappedStatusCalendarError(
  err: CalendarErrShape,
  statusCode: number | undefined
): CalendarApiError | null {
  const entry = statusCode !== undefined ? CALENDAR_STATUS_MAP[statusCode] : undefined
  if (!entry) {
    return null
  }
  return new CalendarApiError(entry.type, entry.message, {
    statusCode,
    retryable: entry.retryable,
    originalError: err as Error,
  })
}

function classifyServerErrorCalendarError(
  err: CalendarErrShape,
  statusCode: number | undefined
): CalendarApiError | null {
  if (statusCode === undefined || statusCode < 500) {
    return null
  }
  return new CalendarApiError('unknown', `Server error: ${statusCode}`, {
    statusCode,
    retryable: true,
    originalError: err as Error,
  })
}

export function classifyError(error: unknown): CalendarApiError {
  const err = error as CalendarErrShape
  const statusCode = toHttpStatus(err.code ?? err.status ?? err.response?.status)

  return (
    classifyNetworkCalendarError(err) ??
    classifyTimeoutCalendarError(err) ??
    classifyForbiddenCalendarError(err, statusCode) ??
    classifyMappedStatusCalendarError(err, statusCode) ??
    classifyServerErrorCalendarError(err, statusCode) ??
    new CalendarApiError(
      'unknown',
      (typeof err.message === 'string' ? err.message : null) ?? CALENDAR_INTERNAL_MESSAGES.UNKNOWN,
      {
        statusCode,
        retryable: false,
        originalError: err as Error,
      }
    )
  )
}

/** Re-export for consumers that pass retry config */
export type { RetryConfig }

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...CALENDAR_RETRY_CONFIG, ...config }
  try {
    return await sharedWithRetry(
      operation,
      (e) => {
        const classified = e instanceof CalendarApiError ? e : classifyError(e)
        return classified.retryable
      },
      retryConfig
    )
  } catch (e) {
    logger.error(e)
    const classified = e instanceof CalendarApiError ? e : classifyError(e)
    throw classified
  }
}

interface FallbackResult<T> {
  data: T
  source: 'fresh' | 'cache' | 'empty'
  error?: CalendarApiError
}

export async function withFallback<T>(
  operation: () => Promise<T>,
  getCached: () => T | null,
  defaultValue: T
): Promise<FallbackResult<T>> {
  try {
    const data = await operation()
    return { data, source: 'fresh' }
  } catch (e) {
    const classifiedError = e instanceof CalendarApiError ? e : classifyError(e)
    logger.warn(`Operation failed (${classifiedError.type}), checking cache`)

    const cachedData = getCached()
    if (cachedData !== null) {
      logger.info('Returning cached data')
      return { data: cachedData, source: 'cache', error: classifiedError }
    }

    logger.warn('No cache available, returning default value')
    return { data: defaultValue, source: 'empty', error: classifiedError }
  }
}

export function logCalendarError(
  context: string,
  error: CalendarApiError,
  additionalInfo?: Record<string, unknown>
): void {
  logger.error(`${context} Calendar API Error:`, {
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    ...additionalInfo,
  })
  if (error.originalError) {
    logger.error(`${context} Original error:`, error.originalError)
  }
}
