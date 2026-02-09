/**
 * Google Calendar Events Service
 * 
 * LEARNING: Service for Google Calendar events API operations
 * WHY: Centralized events operations with caching, rate limiting, retry, and fallback
 * PATTERN: Service layer with infrastructure integration
 */

import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { getCachedEvents, cacheEvents } from '../../calendarEventsCache.js'
import { withRetry, withFallback, logCalendarError } from '../../calendarErrorHandler.js'
import { createLogger } from '../../../utils/logger.js'
import type { CalendarEventsResponseWithMeta } from './calendarTypes.js'
import { transformEventsWithGeocoding } from './calendarHelpers.js'
import { MAX_EVENTS_RESULTS } from './calendarConstants.js'

const logger = createLogger('EventsService')

/**
 * Get full calendar events with locations
 * 
 * LEARNING: Fetches full event details (not just free-busy) to extract locations
 * WHY: Required for drive time calculations between appointments
 * PATTERN: Retry for transient errors, fallback to cache on failure
 * 
 * @param calendarEmail - Calendar email address
 * @param timeMin - Start time for event query
 * @param timeMax - End time for event query
 * @returns Array of calendar events with locations (may be from cache if API fails)
 */
export async function getCalendarEvents(
  calendarEmail: string,
  timeMin: Date | string,
  timeMax: Date | string
): Promise<CalendarEventsResponseWithMeta> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax
  
  // Check cache first (before any API call)
  const cachedData = getCachedEvents(calendarEmail, timeMinDate, timeMaxDate)
  if (cachedData) {
    logger.debug('Events cache hit', { calendarEmail })
    return { events: cachedData, _meta: { source: 'cache' } }
  }
  
  // Define the API operation
  const fetchFromApi = async () => {
    return await withRateLimit('google-calendar', async () => {
      // Create calendar client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      logger.debug('Fetching events', { calendarEmail })
      
      // Make API call to get full events
      const response = await calendar.events.list({
        calendarId: calendarEmail,
        timeMin: timeMinDate.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: MAX_EVENTS_RESULTS // Google Calendar API limit
      })
      
      if (!response.data.items) {
        throw new Error('Invalid response from Google Calendar API')
      }
      
      // Transform response to our cached format with geocoding
      const events = await transformEventsWithGeocoding(response.data.items)
      
      // Cache the response
      cacheEvents(calendarEmail, timeMinDate, timeMaxDate, events)
      
      logger.debug('Successfully fetched events', {
        eventCount: events.length,
        calendarEmail
      })
      
      return events
    })
  }
  
  // Execute with retry and fallback
  const result = await withFallback(
    () => withRetry(fetchFromApi, { maxRetries: 2 }),
    () => getCachedEvents(calendarEmail, timeMinDate, timeMaxDate),
    []  // Empty array as default if no cache
  )
  
  // Log error if one occurred (but we returned fallback data)
  if (result.error) {
    logCalendarError('EventsService.getCalendarEvents', result.error, {
      calendarEmail,
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      source: result.source,
    })
  }
  
  return {
    events: result.data,
    _meta: {
      source: result.source,
      error: result.error?.getUserMessage(),
    },
  }
}
