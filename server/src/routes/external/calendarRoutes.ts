import { Router, Request, Response } from 'express';
import { getFreeBusy, getCalendarEvents, setCalendarCredentials } from '../../services/googleCalendarService.js';
import { getCredentials } from '../../config/googleOAuth.js';
import { getCacheStats, getAllCachedEntries as getAllFreeBusyEntries } from '../../services/freeBusyCache.js';
import { getEventsCacheStats, getAllCachedEntries as getAllEventsEntries } from '../../services/calendarEventsCache.js';
import { getRateLimitStats } from '../../services/rateLimiter.js';

/**
 * Calendar Routes
 * 
 * LEARNING: Routes for Google Calendar API operations
 * WHY: Provides HTTP endpoints for calendar functionality
 * PATTERN: Express router with error handling middleware
 */

const router = Router();

/**
 * POST /api/v1/external/calendar/freebusy
 * Get free-busy information for specified calendars
 * 
 * Request body:
 * {
 *   calendarEmails: string[],
 *   timeMin: string (ISO date string),
 *   timeMax: string (ISO date string)
 * }
 * 
 * Response:
 * {
 *   calendars: {
 *     [email]: {
 *       busy: Array<{start: string, end: string}>
 *     }
 *   }
 * }
 */
router.post('/freebusy', async (req: Request, res: Response) => {
  try {
    const { calendarEmails, timeMin, timeMax } = req.body;
    
    // Validate request body
    if (!calendarEmails || !Array.isArray(calendarEmails) || calendarEmails.length === 0) {
      res.status(400).json({
        error: 'Invalid request: calendarEmails must be a non-empty array'
      });
      return;
    }
    
    if (!timeMin || !timeMax) {
      res.status(400).json({
        error: 'Invalid request: timeMin and timeMax are required'
      });
      return;
    }
    
    // Validate dates
    const timeMinDate = new Date(timeMin);
    const timeMaxDate = new Date(timeMax);
    
    if (isNaN(timeMinDate.getTime()) || isNaN(timeMaxDate.getTime())) {
      res.status(400).json({
        error: 'Invalid request: timeMin and timeMax must be valid ISO date strings'
      });
      return;
    }
    
    if (timeMinDate >= timeMaxDate) {
      res.status(400).json({
        error: 'Invalid request: timeMin must be before timeMax'
      });
      return;
    }
    
    // Check if OAuth credentials are set
    const credentials = getCredentials();
    if (!credentials.access_token) {
      res.status(401).json({
        error: 'Not authenticated: OAuth credentials not found. Please authenticate first.',
        authUrl: '/api/v1/external/oauth'
      });
      return;
    }
    
    // Set credentials for calendar service
    setCalendarCredentials(credentials);
    
    // Get free-busy data
    const freeBusyData = await getFreeBusy(calendarEmails, timeMinDate, timeMaxDate);
    
    res.json(freeBusyData);
    
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in /freebusy:', error);
    
    // Handle specific error types
    if (error.message?.includes('Rate limit')) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message
      });
      return;
    }
    
    if (error.message?.includes('Authentication')) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        authUrl: '/api/v1/external/oauth'
      });
      return;
    }
    
    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/v1/external/calendar/events
 * Get full calendar events with locations for specified calendar
 * 
 * Query parameters:
 * - calendarEmail: string (required) - Calendar email address
 * - timeMin: string (required) - ISO date string
 * - timeMax: string (required) - ISO date string
 * 
 * Response:
 * Array<{
 *   id: string,
 *   start: string,
 *   end: string,
 *   location: string | null,
 *   summary: string | null
 * }>
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { calendarEmail, timeMin, timeMax } = req.query;
    
    // Validate query parameters
    if (!calendarEmail || typeof calendarEmail !== 'string') {
      res.status(400).json({
        error: 'Invalid request: calendarEmail is required'
      });
      return;
    }
    
    if (!timeMin || !timeMax) {
      res.status(400).json({
        error: 'Invalid request: timeMin and timeMax are required'
      });
      return;
    }
    
    // Validate dates
    const timeMinDate = new Date(timeMin as string);
    const timeMaxDate = new Date(timeMax as string);
    
    if (isNaN(timeMinDate.getTime()) || isNaN(timeMaxDate.getTime())) {
      res.status(400).json({
        error: 'Invalid request: timeMin and timeMax must be valid ISO date strings'
      });
      return;
    }
    
    if (timeMinDate >= timeMaxDate) {
      res.status(400).json({
        error: 'Invalid request: timeMin must be before timeMax'
      });
      return;
    }
    
    // Check if OAuth credentials are set
    const credentials = getCredentials();
    if (!credentials.access_token) {
      res.status(401).json({
        error: 'Not authenticated: OAuth credentials not found. Please authenticate first.',
        authUrl: '/api/v1/external/oauth'
      });
      return;
    }
    
    // Set credentials for calendar service
    setCalendarCredentials(credentials);
    
    // Get calendar events
    const events = await getCalendarEvents(calendarEmail, timeMinDate, timeMaxDate);
    
    res.json(events);
    
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in /events:', error);
    
    // Handle specific error types
    if (error.message?.includes('Rate limit')) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message
      });
      return;
    }
    
    if (error.message?.includes('Authentication')) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        authUrl: '/api/v1/external/oauth'
      });
      return;
    }
    
    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * Debug endpoints (dev mode only)
 * LEARNING: Provides visibility into cache and rate limiter state
 * WHY: Useful for debugging and validation during development
 * PATTERN: Only accessible in development environment
 */

/**
 * GET /api/v1/external/calendar/debug/freebusy-cache
 * Get free-busy cache contents and statistics (dev mode only)
 */
router.get('/debug/freebusy-cache', (_req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      error: 'Debug endpoints are not available in production'
    });
    return;
  }
  
  try {
    const stats = getCacheStats();
    const entries = getAllFreeBusyEntries();
    
    // Convert Map to array for JSON serialization
    const entriesArray = Array.from(entries.entries()).map(([key, entry]) => ({
      key,
      data: entry.data,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      expired: (Date.now() - entry.timestamp) > entry.ttl
    }));
    
    res.json({
      stats,
      entries: entriesArray,
      totalEntries: entries.size
    });
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in /debug/freebusy-cache:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/v1/external/calendar/debug/events-cache
 * Get events cache contents and statistics (dev mode only)
 */
router.get('/debug/events-cache', (_req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      error: 'Debug endpoints are not available in production'
    });
    return;
  }
  
  try {
    const stats = getEventsCacheStats();
    const entries = getAllEventsEntries();
    
    // Convert Map to array for JSON serialization
    const entriesArray = Array.from(entries.entries()).map(([key, entry]) => ({
      key,
      data: entry.data,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      expired: (Date.now() - entry.timestamp) > entry.ttl
    }));
    
    res.json({
      stats,
      entries: entriesArray,
      totalEntries: entries.size
    });
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in /debug/events-cache:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/v1/external/calendar/debug/rate-limit
 * Get rate limiter statistics (dev mode only)
 */
router.get('/debug/rate-limit', (_req: Request, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      error: 'Debug endpoints are not available in production'
    });
    return;
  }
  
  try {
    const stats = getRateLimitStats('google-calendar');
    res.json(stats);
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in /debug/rate-limit:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

export { router as CalendarRouter };
