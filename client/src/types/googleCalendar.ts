/**
 * Google Calendar API Type Definitions
 *
 * LEARNING: Uses shared TimeRangeBounds; branded so not assignable to DayHours/DateRangeConfig.
 * Reference: https://developers.google.com/calendar/api/v3/reference/freebusy/query
 */

import type { TimeRangeBounds } from '@shared/types/availabilityTypes'

/** Busy period from Google Calendar free/busy API (RFC3339 start/end). */
export type GoogleCalendarBusyPeriod = TimeRangeBounds & { readonly __brand: 'GoogleCalendarBusyPeriod' }

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
