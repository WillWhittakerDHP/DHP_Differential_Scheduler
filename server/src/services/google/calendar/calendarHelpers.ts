/**
 * Google Calendar API Helper Functions
 * 
 * LEARNING: Utility functions for Google Calendar API operations
 * WHY: Reusable helper functions for data transformation
 * PATTERN: Pure helper functions
 */

import type { CachedCalendarEvent } from '../../calendarEventsCache.js'
import { geocodeAddressToPlaceId } from '../maps/placesApiService.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('CalendarHelpers')

/**
 * Transform Google Calendar API events to cached format with geocoding
 * LEARNING: Converts Google Calendar API response to our cached format and geocodes locations
 * WHY: Provides consistent format and adds placeId for drive time calculations
 * PATTERN: Map over events, geocode locations in parallel
 * 
 * @param googleEvents - Array of events from Google Calendar API
 * @returns Array of cached calendar events with placeIds
 */
export async function transformEventsWithGeocoding(
  googleEvents: Array<{
    id?: string | null
    start?: { dateTime?: string | null; date?: string | null } | null
    end?: { dateTime?: string | null; date?: string | null } | null
    location?: string | null
    summary?: string | null
    eventType?: string | null
  }>
): Promise<CachedCalendarEvent[]> {
  // Filter and transform events
  const eventsWithLocations = googleEvents
    .filter(event => event.start && event.end) // Filter out events without start/end
    .map(event => {
      // Extract start time (handle both dateTime and date formats)
      const startTime = event.start?.dateTime || event.start?.date
      const endTime = event.end?.dateTime || event.end?.date
      
      if (!startTime || !endTime) {
        return null
      }
      
      return {
        id: event.id || '',
        start: startTime,
        end: endTime,
        location: event.location || null, // Temporary - will be geocoded to placeId
        summary: event.summary || null,
        eventType: event.eventType || 'default'
      }
    })
    .filter((event): event is { id: string; start: string; end: string; location: string | null; summary: string | null; eventType: string } => event !== null)
  
  // Geocode addresses to placeIds
  // LEARNING: Convert address strings to placeIds for accurate drive time calculations
  // WHY: placeId is primary location identifier throughout codebase
  // PATTERN: Process geocoding in parallel for all events with locations
  const events: CachedCalendarEvent[] = await Promise.all(
    eventsWithLocations.map(async (event) => {
      if (event.location) {
        try {
          const placeId = await geocodeAddressToPlaceId(event.location)
          return {
            id: event.id,
            start: event.start,
            end: event.end,
            placeId: placeId || undefined, // Store placeId if found, undefined if not
            summary: event.summary,
            eventType: event.eventType || 'default'
          }
        } catch (error) {
          // Log warning but continue - geocoding failure shouldn't break event fetching
          logger.warn('Failed to geocode location', {
            location: event.location,
            eventId: event.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          return {
            id: event.id,
            start: event.start,
            end: event.end,
            placeId: undefined, // No placeId if geocoding failed
            summary: event.summary,
            eventType: event.eventType || 'default'
          }
        }
      }
      // Event has no location
      return {
        id: event.id,
        start: event.start,
        end: event.end,
        placeId: undefined,
        summary: event.summary,
        eventType: event.eventType || 'default'
      }
    })
  )
  
  return events
}

/**
 * Transform free-busy response to our format
 * LEARNING: Filters and transforms busy periods from Google Calendar API
 * WHY: Ensures consistent format and filters invalid periods
 * PATTERN: Map over calendars, filter busy periods
 * 
 * @param googleCalendars - Calendar data from Google Calendar API
 * @returns Transformed free-busy data
 */
export function transformFreeBusyResponse(googleCalendars: {
  [email: string]: {
    busy?: Array<{ start?: string | null; end?: string | null } | null> | null
  } | null
}): {
  calendars: {
    [email: string]: {
      busy: Array<{
        start: string
        end: string
      }>
    }
  }
} {
  const freeBusyData: {
    calendars: {
      [email: string]: {
        busy: Array<{
          start: string
          end: string
        }>
      }
    }
  } = {
    calendars: {}
  }
  
  for (const [email, calendarData] of Object.entries(googleCalendars)) {
    if (!calendarData) {
      continue
    }
    
    // Filter out null/undefined busy periods and ensure start/end are strings
    const rawBusyPeriods = calendarData.busy || []
    const filteredBusyPeriods = rawBusyPeriods.filter(period => period && period.start && period.end)
    
    const busyPeriods = filteredBusyPeriods.map(period => ({
      start: period!.start!,
      end: period!.end!
    }))
    
    freeBusyData.calendars[email] = {
      busy: busyPeriods
    }
  }
  
  return freeBusyData
}
