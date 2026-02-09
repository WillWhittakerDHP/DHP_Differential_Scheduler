/**
 * Google Calendar Free-Busy Service
 * 
 * LEARNING: Service for Google Calendar free-busy API operations
 * WHY: Centralized free-busy operations with caching, rate limiting, retry, and fallback
 * PATTERN: Service layer with infrastructure integration
 */

import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { getCachedFreeBusy, cacheFreeBusy, invalidateCache as invalidateFreeBusyCache } from '../../freeBusyCache.js'
import { withRetry, withFallback, logCalendarError } from '../../calendarErrorHandler.js'
import { createLogger } from '../../../utils/logger.js'
import type { FreeBusyResponse, FreeBusyResponseWithMeta } from './calendarTypes.js'
import { transformFreeBusyResponse } from './calendarHelpers.js'

const logger = createLogger('FreeBusyService')

/**
 * Get free-busy information for specified calendars
 * 
 * LEARNING: Integrates rate limiter, cache, retry, and fallback
 * WHY: Provides resilient API calls with graceful degradation
 * PATTERN: Retry for transient errors, fallback to cache on failure
 * 
 * @param calendarEmails - Array of calendar email addresses to check
 * @param timeMin - Start time for free-busy query
 * @param timeMax - End time for free-busy query
 * @param skipCache - Whether to skip cache check (default: false)
 * @returns Free-busy data for specified calendars (may be from cache if API fails)
 */
export async function getFreeBusy(
  calendarEmails: string[],
  timeMin: Date | string,
  timeMax: Date | string,
  skipCache: boolean = false
): Promise<FreeBusyResponseWithMeta> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax
  
  // Check cache first (before any API call) unless skipCache is true
  if (!skipCache) {
    const cachedData = getCachedFreeBusy(calendarEmails, timeMinDate, timeMaxDate)
    if (cachedData) {
      // Log cache contents
      const totalCachedPeriods = Object.values(cachedData.calendars || {})
        .reduce((sum: number, cal: any) => sum + (cal.busy?.length || 0), 0)
      logger.debug('Cache hit for free-busy', {
        calendarCount: calendarEmails.length,
        calendarKeysCount: Object.keys(cachedData.calendars || {}).length,
        totalBusyPeriods: totalCachedPeriods,
        calendars: Object.entries(cachedData.calendars || {}).map(([email, data]: [string, any]) => ({
          email,
          busyCount: data.busy?.length || 0,
          busyPeriods: data.busy?.map((p: any) => `${p.start} to ${p.end}`) || []
        }))
      })
      return { ...cachedData, _meta: { source: 'cache' } }
    }
  } else {
    logger.debug('skipCache=true, bypassing cache check')
  }
  
  // Define the API operation
  const fetchFromApi = async (): Promise<FreeBusyResponse> => {
    return await withRateLimit('google-calendar', async () => {
      // Create calendar client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      // Prepare request body
      const requestBody = {
        timeMin: timeMinDate.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        items: calendarEmails.map(email => ({ id: email }))
      }
      
      logger.debug('Fetching free-busy', {
        calendarCount: calendarEmails.length,
        timeMin: timeMinDate.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        calendars: calendarEmails
      })
      
      // Make API call
      const response = await calendar.freebusy.query({
        requestBody
      })
      
      if (!response.data.calendars) {
        throw new Error('Invalid response from Google Calendar API')
      }
      
      // Log raw API response
      logger.debug('Raw API response received', {
        calendarCount: Object.keys(response.data.calendars).length,
        calendars: Object.entries(response.data.calendars).map(([email, data]) => ({
          email,
          busyCount: data.busy?.length || 0,
          busyPeriods: data.busy?.map(p => ({ start: p.start, end: p.end })) || []
        }))
      })
      
      // Transform response to our format
      const freeBusyData = transformFreeBusyResponse(response.data.calendars)
      
      // Log filtering results
      const totalBusyPeriods = Object.values(freeBusyData.calendars)
        .reduce((sum, cal) => sum + (cal.busy?.length || 0), 0)
      
      logger.debug('Processed free-busy response', {
        totalBusyPeriods,
        calendarCount: Object.keys(freeBusyData.calendars).length
      })
      
      // Cache the response
      cacheFreeBusy(calendarEmails, timeMinDate, timeMaxDate, freeBusyData)
      
      logger.debug('Successfully fetched free-busy data')
      
      return freeBusyData
    })
  }
  
  // Execute with retry and fallback
  // LEARNING: withFallback wraps the retry operation
  // WHY: If all retries fail, we still try to return cached data
  const result = await withFallback<FreeBusyResponse>(
    () => withRetry(fetchFromApi, { maxRetries: 2 }),
    () => getCachedFreeBusy(calendarEmails, timeMinDate, timeMaxDate),
    { calendars: {} }  // Empty default if no cache
  )
  
  // Log error if one occurred (but we returned fallback data)
  if (result.error) {
    logCalendarError('FreeBusyService.getFreeBusy', result.error, {
      calendarEmails,
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      source: result.source,
    })
  }
  
  return {
    ...result.data,
    _meta: {
      source: result.source,
      error: result.error?.getUserMessage(),
    },
  }
}
