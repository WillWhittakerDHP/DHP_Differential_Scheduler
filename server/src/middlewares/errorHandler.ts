import { NextFunction, Response, Request } from "express";
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
  res.status(status).json({
    message,
    status,
    stack: isProduction() ? "🥞" : stack,
  });
};
