
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

export async function getCalendarEvents(
  calendarEmail: string,
  timeMin: Date | string,
  timeMax: Date | string
): Promise<CalendarEventsResponseWithMeta> {
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax
  
  const now = new Date()
  const effectiveTimeMin = timeMinDate < now ? now : timeMinDate
  
  const cachedData = getCachedEvents(calendarEmail, timeMinDate, timeMaxDate)
  if (cachedData) {
    return { events: cachedData, _meta: { source: 'cache' } }
  }
  
  const fetchFromApi = async () => {
    return await withRateLimit('google-calendar', async () => {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      logger.debug('Fetching events', { calendarEmail })
      
      const response = await calendar.events.list({
        calendarId: calendarEmail,
        timeMin: effectiveTimeMin.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: MAX_EVENTS_RESULTS // Google Calendar API limit
      })
      
      if (!response.data.items) {
        throw new Error('Invalid response from Google Calendar API')
      }
      
      const events = await transformEventsWithGeocoding(response.data.items)
      cacheEvents(calendarEmail, timeMinDate, timeMaxDate, events)
      
      logger.debug('Fetched events', { calendarEmail, count: events.length })
      
      return events
    })
  }
  
  const result = await withFallback(
    () => withRetry(fetchFromApi, { maxRetries: 2 }),
    () => getCachedEvents(calendarEmail, timeMinDate, timeMaxDate),
    []  // Empty array as default if no cache
  )
  
  if (result.error) {
    logCalendarError('EventsService.getCalendarEvents', result.error, {
      calendarEmail,
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
