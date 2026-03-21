/**
 * Dev Status Router
 * 
 * 
 * SECURITY: Only available in development mode (when !isProduction())
 */

import { Router, Request, Response } from 'express'
import { getCredentials, hasCredentials } from '../../../config/googleOAuth.js'
import { getEventsCacheStats, getAllCachedEntries as getAllEventsEntries, type EventsCacheEntry } from '../../../services/calendarEventsCache.js'
import { getRateLimitStats } from '../../../services/rateLimiter.js'
import { getDriveTimeCacheStats, getAllCachedDriveTimes } from '../../../services/driveTimeCache.js'
import { sendSuccess, sendError } from '../../helpers/routerResponseHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import { isProduction } from '../../../utils/envHelpers.js'
import { CALENDAR_ROUTE_MESSAGES } from '../../external/calendarRouteConstants.js'

const logger = createLogger('DevStatusRouter')

const router = Router()

router.get('/status', (_req: Request, res: Response): void => {
  if (isProduction()) {
    sendError(res, CALENDAR_ROUTE_MESSAGES.DEBUG_DISABLED, HTTP_STATUS_CODES.FORBIDDEN)
    return
  }
  
  try {
    let oauthStatus
    try {
      const credentials = getCredentials()
      const authenticated = hasCredentials()
      
      oauthStatus = {
        authenticated,
        hasRefreshToken: !!credentials?.refresh_token,
        expiryDate: credentials?.expiry_date ?? null,
        authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL
      }
    } catch (credError: unknown) {
      const credMessage = credError instanceof Error ? credError.message : String(credError);
      oauthStatus = {
        authenticated: false,
        authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL,
        error: credMessage
      }
    }
    
    const rateLimits = {
      calendar: getRateLimitStats('google-calendar'),
      maps: getRateLimitStats('google-maps')
    }
    
    const eventsCacheStats = getEventsCacheStats()
    const eventsEntries = getAllEventsEntries()
    const eventsEntriesArray = Array.from(eventsEntries.entries()).map((entryPair: [string, EventsCacheEntry]) => {
      const [key, entry] = entryPair
      return {
        key,
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        age: Date.now() - entry.timestamp,
        expired: (Date.now() - entry.timestamp) > entry.ttl
      }
    })
    
    const driveTimeCacheStats = getDriveTimeCacheStats()
    const driveTimeEntries = getAllCachedDriveTimes()
    const driveTimeEntriesArray: Array<{
      key: string
      data: {
        durationSeconds: number
        distanceMeters: number
        durationMinutes: number
        distanceMiles: number
      }
      timestamp: number
      age: number
      expired: boolean
    }> = []
    
    for (const [key, entry] of driveTimeEntries.entries()) {
      driveTimeEntriesArray.push({
        key,
        data: {
          durationSeconds: entry.durationSeconds,
          distanceMeters: entry.distanceMeters,
          durationMinutes: Math.ceil(entry.durationSeconds / 60),
          distanceMiles: Math.round(entry.distanceMeters / 1609.34 * 10) / 10
        },
        timestamp: entry.timestamp,
        age: Date.now() - entry.timestamp,
        expired: (Date.now() - entry.timestamp) > (24 * 60 * 60 * 1000) // 24 hour TTL
      })
    }
    
    const devStatus = {
      oauth: oauthStatus,
      rateLimits,
      caches: {
        events: {
          stats: eventsCacheStats,
          entries: eventsEntriesArray,
          totalEntries: eventsEntries.size
        },
        driveTime: {
          stats: {
            totalEntries: driveTimeCacheStats.totalEntries,
            oldestEntryAge: driveTimeCacheStats.oldestEntryAge,
            memoryUsage: driveTimeCacheStats.memoryEstimateBytes
          },
          entries: driveTimeEntriesArray,
          totalEntries: driveTimeEntries.size
        }
      }
    }
    
    sendSuccess(res, devStatus)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error in /status:', error)
    sendError(res, 'Failed to fetch dev status', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, message)
  }
})

export { router as DevStatusRouter }
