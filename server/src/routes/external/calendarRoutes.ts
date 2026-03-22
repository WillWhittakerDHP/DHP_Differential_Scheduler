import { Router, Request, Response } from 'express';
import Joi from 'joi';
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

const createEventBodySchema = Joi.object({
  calendarId: Joi.string().required(),
  summary: Joi.string().required(),
  start: Joi.string().required(),
  end: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  location: Joi.string().allow('').optional(),
  // @audit-allow:hardcoding:fieldMapping - Joi schema shape for request validation
  attendees: Joi.array().items(Joi.object({ email: Joi.string().email().required() })).optional(),
  sendUpdates: Joi.string().valid('all', 'externalOnly', 'none').optional(),
})

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

router.post(
  '/events',
  csrfProtection,
  withCalendarErrorHandling(async (req: Request, res: Response): Promise<void> => {
    const validation = createEventBodySchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
      sendBadRequest(res, validation.error.message);
      return;
    }
    const { calendarId, summary, start, end, description, location, attendees, sendUpdates } = validation.value;

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
