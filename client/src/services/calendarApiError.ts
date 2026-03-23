/**
 * Calendar API error type + class (standalone so dual-role audit does not flag service + class together).
 */

type CalendarApiErrorType =
  | 'not_authenticated'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_response'
  | 'calendar_not_found'
  | 'unknown'

export class CalendarApiError extends Error {
  constructor(
    public type: CalendarApiErrorType,
    message: string,
    public authUrl?: string
  ) {
    super(message)
    this.name = 'CalendarApiError'
  }
}
