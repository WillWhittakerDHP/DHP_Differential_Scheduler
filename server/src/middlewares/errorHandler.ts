/**
 * Error handler: response message and stack are sanitized when NODE_ENV is production.
 */
import { NextFunction, Response, Request } from "express";
import { INTERNAL_SERVER_ERROR } from "@shared/constants/errorMessages.js";
import { createLogger } from "../utils/logger.js";
import { isProduction } from "../utils/envHelpers.js";

const logger = createLogger('ErrorHandler');

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { message, stack } = error;
  const status = res.statusCode || 500;
  logger.error(`[${status}] ${message}`, stack);
  const safeMessage = isProduction() ? INTERNAL_SERVER_ERROR : message;
  res.status(status).json({
    message: safeMessage,
    status,
    stack: isProduction() ? undefined : stack,
  });
};
