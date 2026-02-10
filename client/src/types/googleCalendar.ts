/**
 * Google Calendar API Type Definitions
 * 
 * LEARNING: Type definitions matching Google Calendar API v3 freebusy response format
 * WHY: Type-safe representation of Google Calendar API responses for future integration
 * PATTERN: Matches official Google Calendar API documentation exactly
 * 
 * Reference: https://developers.google.com/calendar/api/v3/reference/freebusy/query
 */

/**
 * A busy period from Google Calendar free/busy API
 * LEARNING: RFC3339 format timestamps (ISO 8601 with timezone)
 * WHY: Google Calendar API returns timestamps in RFC3339 format
 * PATTERN: start and end are strings, not Date objects (as returned by API)
 */
export interface GoogleCalendarBusyPeriod {
  start: string  // RFC3339 format: "2026-01-15T14:30:00Z" or "2026-01-15T14:30:00-05:00"
  end: string    // RFC3339 format
}

interface GoogleCalendarError {
  domain: string  // Error domain (e.g., "global")
  reason: string   // Error reason (e.g., "notFound", "groupTooBig")
}

/**
 * Free/busy information for a single calendar
 * LEARNING: Each calendar can have multiple busy periods and optional errors
 * WHY: Google Calendar API returns busy periods per calendar
 * PATTERN: busy array contains all busy periods, errors array is optional
 */
interface GoogleCalendarFreeBusy {
  busy: GoogleCalendarBusyPeriod[]
  errors?: GoogleCalendarError[]
}

interface GoogleCalendarGroup {
  calendars: string[]
  errors?: GoogleCalendarError[]
}

/**
 * Google Calendar free/busy API response structure
 * LEARNING: Matches the exact response format from Google Calendar API v3
 * WHY: Type safety when working with API responses
 * PATTERN: calendars is a map of calendar IDs to their free/busy data
 * 
 * Example response:
 * {
 *   "kind": "calendar#freeBusy",
 *   "timeMin": "2026-01-15T00:00:00Z",
 *   "timeMax": "2026-01-16T00:00:00Z",
 *   "calendars": {
 *     "primary": {
 *       "busy": [
 *         { "start": "2026-01-15T10:00:00Z", "end": "2026-01-15T11:00:00Z" }
 *       ]
 *     }
 *   }
 * }
 */
export interface GoogleFreeBusyResponse {
  kind: 'calendar#freeBusy'
  timeMin: string  // RFC3339 format - start of queried interval
  timeMax: string  // RFC3339 format - end of queried interval
  calendars?: Record<string, GoogleCalendarFreeBusy>
  groups?: Record<string, GoogleCalendarGroup>
}
