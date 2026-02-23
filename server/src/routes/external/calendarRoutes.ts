/**
 * Calendar Routes
 *
 *
 * SESSION: 2.1.5 - Enhanced error handling with CalendarApiError
 */

import { Router, Request, Response } from 'express';
import { createEvent } from '../../services/google/calendar/eventCreationService.js';
import { setCalendarCredentials } from '../../services/google/calendar/calendarCredentials.js';
import type {
  CreateEventParams,
  EventAttendee,
} from '../../services/google/calendar/calendarTypes.js';
import { getCredentials } from '../../config/googleOAuth.js';
import { CalendarApiError } from '../../services/calendarErrorHandler.js';
import { createLogger } from '../../utils/logger.js';
import { csrfProtection } from '../../middlewares/security.js';
import { sendBadRequest, sendCreated } from '../helpers/routerResponseHelpers.js';
import { CalendarDebugRouter } from './calendarDebugRoutes.js';
import { CALENDAR_ROUTE_MESSAGES } from './calendarRouteConstants.js';

const logger = createLogger('CalendarRoutes');

const router = Router();

type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>;

function withCalendarErrorHandling(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      logger.error('Calendar route error:', error);
      if (error instanceof CalendarApiError) {
        const statusCode = error.getStatusCode();
        res.status(statusCode).json({
          error: error.type,
          message: error.getUserMessage(),
          retryable: error.retryable,
          ...((error.type === 'auth' || error.type === 'permission') && {
            authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL,
          }),
        });
        return;
      }
      res.status(500).json({
        error: 'unknown',
        message: error instanceof Error ? error.message : CALENDAR_ROUTE_MESSAGES.UNEXPECTED_ERROR,
      });
    }
  };
}

/**
 * POST /api/v1/external/calendar/events
 * Create a new calendar event with optional attendee invitations
 */
router.post(
  '/events',
  csrfProtection,
  withCalendarErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const {
      calendarId,
      summary,
      start,
      end,
      description,
      location,
      attendees,
      sendUpdates,
    } = req.body;

    if (!calendarId || typeof calendarId !== 'string') {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.MISSING_CALENDAR_ID);
      return;
    }
    if (!summary || typeof summary !== 'string') {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.MISSING_SUMMARY);
      return;
    }
    if (!start || !end) {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.MISSING_TIMES);
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.INVALID_DATES);
      return;
    }
    if (startDate >= endDate) {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.START_BEFORE_END);
      return;
    }

    if (attendees) {
      if (!Array.isArray(attendees)) {
        sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.INVALID_ATTENDEES);
        return;
      }
      const invalidAttendee = attendees.find(
        (a: { email?: unknown }) => !a?.email || typeof a.email !== 'string'
      );
      if (invalidAttendee) {
        sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.INVALID_ATTENDEE_EMAIL);
        return;
      }
    }

    if (
      sendUpdates &&
      !CALENDAR_ROUTE_MESSAGES.VALID_SEND_UPDATES.includes(sendUpdates)
    ) {
      sendBadRequest(res, CALENDAR_ROUTE_MESSAGES.INVALID_SEND_UPDATES);
      return;
    }

    const credentials = getCredentials();
    if (!credentials.access_token) {
      res.status(401).json({
        error: CALENDAR_ROUTE_MESSAGES.NOT_AUTHENTICATED,
        authUrl: CALENDAR_ROUTE_MESSAGES.AUTH_URL,
      });
      return;
    }

    setCalendarCredentials(credentials);

    const eventParams: CreateEventParams = {
      calendarId,
      summary,
      start: startDate,
      end: endDate,
    };
    if (description) eventParams.description = description;
    if (location) eventParams.location = location;
    if (attendees?.length > 0) eventParams.attendees = attendees as EventAttendee[];
    if (sendUpdates) eventParams.sendUpdates = sendUpdates;

    const createdEvent = await createEvent(eventParams);
    sendCreated(res, createdEvent);
  })
);

router.use('/debug', CalendarDebugRouter);

export { router as CalendarRouter };
