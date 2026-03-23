import type { Response } from 'express';
import { MapsApiError } from '../../services/google/maps/mapsErrorHandler.js';
import { MAPS_ROUTE_MESSAGES } from './mapsRouteConstants.js';

function getStatusCodeForError(type: string): number {
  const statusMap: Record<string, number> = {
    auth: 401,
    rate_limit: 429,
    invalid: 400,
    not_found: 404,
    network: 502,
  };
  return statusMap[type] ?? 500;
}

export function sendMapsRouteErrorResponse(res: Response, error: unknown): void {
  if (error instanceof MapsApiError) {
    const statusCode = getStatusCodeForError(error.type);
    res.status(statusCode).json({
      error: error.getUserMessage(),
      type: error.type,
      retryable: error.retryable,
    });
    return;
  }

  res.status(500).json({
    error: MAPS_ROUTE_MESSAGES.INTERNAL_SERVER_ERROR,
    type: 'unknown',
  });
}
