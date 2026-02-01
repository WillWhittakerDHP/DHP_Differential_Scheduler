import { Router, Request, Response } from 'express';
import { getFreeBusy, setCalendarCredentials } from '../../services/googleCalendarService.js';
import { getCredentials } from '../../config/googleOAuth.js';

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

export { router as CalendarRouter };
