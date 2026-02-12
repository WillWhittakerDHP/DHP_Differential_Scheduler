/**
 * Beta Feedback Router Error Handler
 *
 * LEARNING: Thin wrappers around shared router error handlers
 * WHY: Consistent error responses; no domain-specific constraints needed
 * PATTERN: Delegates to shared handleRouteError
 */

import { Response } from 'express';
import {
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js';

export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string
): void {
  sharedHandleRouteError(error, res, errorMessage, context);
}
