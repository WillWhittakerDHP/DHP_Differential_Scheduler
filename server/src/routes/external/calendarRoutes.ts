import { Router, Request, Response } from 'express';
import { createEvent } from '../../services/google/calendar/eventCreationService.js';
import { setCalendarCredentials } from '../../services/google/calendar/calendarCredentials.js';
import type {
  CreateEventParams,
  EventAttendee
} from '../../services/google/calendar/calendarTypes.js';
import { getCredentials } from '../../config/googleOAuth.js';
import { getCacheStats, getAllCachedEntries as getAllFreeBusyEntries } from '../../services/freeBusyCache.js';
import { getEventsCacheStats, getAllCachedEntries as getAllEventsEntries } from '../../services/calendarEventsCache.js';
import { getRateLimitStats } from '../../services/rateLimiter.js';
import { CalendarApiError, type CalendarErrorType } from '../../services/calendarErrorHandler.js';

/**
 * Calendar Routes
 * 
 * LEARNING: Routes for Google Calendar API operations
 * WHY: Provides HTTP endpoints for calendar functionality
 * PATTERN: Express router with typed error handling
 * 
 * SESSION: 2.1.5 - Enhanced error handling with CalendarApiError
 */

/**
 * Map CalendarApiError type to HTTP status code
 * LEARNING: Consistent HTTP status codes for different error types
 * WHY: Clients can handle errors based on status code
 */
function getStatusCodeForError(error: CalendarApiError): number {
  switch (error.type) {
    case 'auth':
      return 401;
    case 'permission':
      return 403;
    case 'rateLimit':
      return 429;
    case 'notFound':
      return 404;
    case 'network':
    case 'timeout':
      return 503; // Service Unavailable
    case 'invalid':
      return 400;
    default:
      return 500;
  }
}

const router = Router();

// Phase 10: Removed POST /freebusy and GET /events endpoints
// WHY: These booking-flow-only endpoints are replaced by POST /computed-data
// Free-busy and events are now fetched server-side via the orchestrator

/**
 * POST /api/v1/external/calendar/events
 * Create a new calendar event with optional attendee invitations
 * 
 * LEARNING: Creates events on Google Calendar with invitation support
 * WHY: Core booking functionality - creates appointment on calendar
 * PATTERN: Validates input, creates event, invalidates cache
 * 
 * Request body:
 * {
 *   calendarId: string (required) - Calendar email to create event on
 *   summary: string (required) - Event title
 *   start: string (required) - ISO date string for event start
 *   end: string (required) - ISO date string for event end
 *   description?: string - Event description/notes
 *   location?: string - Physical location/address
 *   attendees?: Array<{email: string, displayName?: string, optional?: boolean}>
 *   sendUpdates?: 'all' | 'externalOnly' | 'none' - Whether to send invitation emails
 * }
 * 
 * Response:
 * {
 *   id: string - Google Calendar event ID
 *   htmlLink: string - Link to view event in Google Calendar
 *   summary: string - Event title
 *   start: string - Start time (ISO)
 *   end: string - End time (ISO)
 *   location?: string - Location if provided
 *   attendees?: Array<{email: string, responseStatus: string}>
 * }
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const {
      calendarId,
      summary,
      start,
      end,
      description,
      location,
      attendees,
      sendUpdates
    } = req.body;
    
    // Validate required fields
    if (!calendarId || typeof calendarId !== 'string') {
      res.status(400).json({
        error: 'Invalid request: calendarId is required'
      });
      return;
    }
    
    if (!summary || typeof summary !== 'string') {
      res.status(400).json({
        error: 'Invalid request: summary (event title) is required'
      });
      return;
    }
    
    if (!start || !end) {
      res.status(400).json({
        error: 'Invalid request: start and end times are required'
      });
      return;
    }
    
    // Validate dates
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({
        error: 'Invalid request: start and end must be valid ISO date strings'
      });
      return;
    }
    
    if (startDate >= endDate) {
      res.status(400).json({
        error: 'Invalid request: start must be before end'
      });
      return;
    }
    
    // Validate attendees if provided
    if (attendees) {
      if (!Array.isArray(attendees)) {
        res.status(400).json({
          error: 'Invalid request: attendees must be an array'
        });
        return;
      }
      
      // Validate each attendee has an email
      for (const attendee of attendees) {
        if (!attendee.email || typeof attendee.email !== 'string') {
          res.status(400).json({
            error: 'Invalid request: each attendee must have an email address'
          });
          return;
        }
      }
    }
    
    // Validate sendUpdates if provided
    if (sendUpdates && !['all', 'externalOnly', 'none'].includes(sendUpdates)) {
      res.status(400).json({
        error: 'Invalid request: sendUpdates must be "all", "externalOnly", or "none"'
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
    
    // Build event params
    const eventParams: CreateEventParams = {
      calendarId,
      summary,
      start: startDate,
      end: endDate
    };
    
    if (description) {
      eventParams.description = description;
    }
    
    if (location) {
      eventParams.location = location;
    }
    
    if (attendees && attendees.length > 0) {
      eventParams.attendees = attendees as EventAttendee[];
    }
    
    if (sendUpdates) {
      eventParams.sendUpdates = sendUpdates;
    }
    
    // Create the event
    const createdEvent = await createEvent(eventParams);
    
    res.status(201).json(createdEvent);
    
  } catch (error: any) {
    console.error('[CalendarRoutes] Error in POST /events:', error);
    
    // Handle typed CalendarApiError
    if (error instanceof CalendarApiError) {
      const statusCode = getStatusCodeForError(error);
      res.status(statusCode).json({
        error: error.type,
        message: error.getUserMessage(),
        retryable: error.retryable,
        ...(error.type === 'auth' && { authUrl: '/api/v1/external/oauth' }),
        ...(error.type === 'permission' && { authUrl: '/api/v1/external/oauth' }),
      });
      return;
    }
    
    // Generic error fallback
    res.status(500).json({
      error: 'unknown',
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
