/**
 * Maps Debug Routes
 *
 * LEARNING: Debug endpoints for Maps API (rate limit, drive time cache)
 * WHY: Separates debug routes from main Places API routes for better cohesion
 */

import { Router, Request, Response } from 'express'
import { csrfProtection } from '../../middlewares/security.js'
import { getRateLimitStats } from '../../services/rateLimiter.js'
import {
  getDriveTimeCacheStats,
  getAllCachedDriveTimes,
  clearDriveTimeCache
} from '../../services/driveTimeCache.js'
import { createLogger } from '../../utils/logger.js'
import { MAPS_ROUTE_MESSAGES } from './mapsRouteConstants.js'

const logger = createLogger('MapsDebugRoutes')

const DEBUG_TTL_MS = 24 * 60 * 60 * 1000

const router = Router()

function rejectProduction(_req: Request, res: Response): boolean {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: MAPS_ROUTE_MESSAGES.DEBUG_DISABLED })
    return true
  }
  return false
}

router.get('/rate-limit', (_req: Request, res: Response): void => {
  if (rejectProduction(_req, res)) return
  const stats = getRateLimitStats('google-maps')
  res.json(stats)
})

router.get('/drive-time-cache', (_req: Request, res: Response): void => {
  if (rejectProduction(_req, res)) return
  try {
    const stats = getDriveTimeCacheStats()
    const entries = getAllCachedDriveTimes()
    const entriesArray = Array.from(entries.entries()).map(([key, entry]) => ({
      key,
      data: {
        durationSeconds: entry.durationSeconds,
        distanceMeters: entry.distanceMeters,
        durationMinutes: Math.ceil(entry.durationSeconds / 60),
        distanceMiles: Math.round(entry.distanceMeters / 1609.34 * 10) / 10
      },
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
      expired: Date.now() - entry.timestamp > DEBUG_TTL_MS
    }))
    res.json({
      stats: {
        totalEntries: stats.totalEntries,
        oldestEntryAge: stats.oldestEntryAge,
        memoryUsage: stats.memoryEstimateBytes
      },
      entries: entriesArray,
      totalEntries: entries.size
    })
  } catch (error: unknown) {
    logger.error('Error in /debug/drive-time-cache:', error)
    res.status(500).json({
      error: MAPS_ROUTE_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error instanceof Error ? error.message : MAPS_ROUTE_MESSAGES.UNEXPECTED_ERROR
    })
  }
})

router.post('/clear-drive-time-cache', csrfProtection, (_req: Request, res: Response): void => {
  if (rejectProduction(_req, res)) return
  clearDriveTimeCache()
  res.json({ success: true, message: MAPS_ROUTE_MESSAGES.DRIVE_TIME_CACHE_CLEARED })
})

export { router as MapsDebugRouter }
