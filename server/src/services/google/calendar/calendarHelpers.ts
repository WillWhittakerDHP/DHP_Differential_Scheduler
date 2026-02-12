/**
 * Google Calendar API Helper Functions
 * 
 * LEARNING: Utility functions for Google Calendar API operations
 * WHY: Reusable helper functions for data transformation
 * PATTERN: Pure helper functions
 */

import type { CachedCalendarEvent } from '../../calendarEventsCache.js'
import { geocodeAddressToPlaceId } from '../maps/placesApiService.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../../constants/router.js'
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
    transparency?: string | null  // 'opaque' (blocks time) or 'transparent' (free)
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
      
      const rawId = event.id
      return {
        id: rawId !== undefined && rawId !== null && rawId !== '' ? rawId : '',
        start: startTime,
        end: endTime,
        location: event.location || null, // Temporary - will be geocoded to placeId
        summary: event.summary || null,
        eventType: event.eventType || 'default',
        transparency: event.transparency || undefined
      }
    })
    .filter((event): event is NonNullable<typeof event> => event !== null)
  
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
            eventType: event.eventType || 'default',
            transparency: event.transparency
          }
        } catch (error) {
          // Log warning but continue - geocoding failure shouldn't break event fetching
          logger.warn('Failed to geocode location', {
            location: event.location,
            eventId: event.id,
            error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
          })
          return {
            id: event.id,
            start: event.start,
            end: event.end,
            placeId: undefined, // No placeId if geocoding failed
            summary: event.summary,
            eventType: event.eventType || 'default',
            transparency: event.transparency
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
        eventType: event.eventType || 'default',
        transparency: event.transparency
      }
    })
  )
  
  return events
}
