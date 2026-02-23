/**
 * Beta Feedback Router Error Handler
 *
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
