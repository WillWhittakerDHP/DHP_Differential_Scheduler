
import { Router, Request, Response } from 'express';
import { getEventsCacheStats, getAllCachedEntries as getAllEventsEntries } from '../../services/calendarEventsCache.js';
import { getRateLimitStats } from '../../services/rateLimiter.js';
import { createLogger } from '../../utils/logger.js';
import { isProduction } from '../../utils/envHelpers.js';
import { sendError } from '../helpers/routerResponseHelpers.js';
import { CALENDAR_ROUTE_MESSAGES } from './calendarRouteConstants.js';

const logger = createLogger('CalendarDebugRoutes');

const router = Router();

function rejectProduction(_req: Request, res: Response): boolean {
  if (isProduction()) {
    res.status(403).json({ error: CALENDAR_ROUTE_MESSAGES.DEBUG_DISABLED });
    return true;
  }
  return false;
}

router.get('/events-cache', (_req: Request, res: Response): void => {
  if (rejectProduction(_req, res)) return;
  try {
    const stats = getEventsCacheStats();
    const entries = getAllEventsEntries();
    const entriesArray = Array.from(entries.entries()).map(([key, entry]) => ({
      key,
      data: entry.data,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      expired: (Date.now() - entry.timestamp) > entry.ttl,
    }));
    res.json({
      stats,
      entries: entriesArray,
      totalEntries: entries.size,
    });
  } catch (error: unknown) {
    logger.error('Error in /debug/events-cache:', error);
    sendError(
      res,
      error instanceof Error ? error.message : CALENDAR_ROUTE_MESSAGES.UNEXPECTED_ERROR,
      500
    );
  }
});

router.get('/rate-limit', (_req: Request, res: Response): void => {
  if (rejectProduction(_req, res)) return;
  try {
    const stats = getRateLimitStats('google-calendar');
    res.json(stats);
  } catch (error: unknown) {
    logger.error('Error in /debug/rate-limit:', error);
    sendError(
      res,
      error instanceof Error ? error.message : CALENDAR_ROUTE_MESSAGES.UNEXPECTED_ERROR,
      500
    );
  }
});

export { router as CalendarDebugRouter };
