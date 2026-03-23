import type { Response } from 'express';
import { CalendarApiError } from '../../services/calendarErrorHandler.js';
import { CALENDAR_ROUTE_MESSAGES } from './calendarRouteConstants.js';

export function sendCalendarRouteErrorResponse(res: Response, error: unknown): void {
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
