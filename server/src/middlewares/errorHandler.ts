import { NextFunction, Response, Request } from "express";

// WHY: Express error handler signature requires all 4 parameters, but some may be unused
// PATTERN: Prefix unused parameters with underscore to indicate intentional non-use
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { message, stack } = error;
  const status = res.statusCode || 500;
  res.status(status).json({
    message,
    status,
    stack: process.env.NODE_ENV === "production" ? "🥞" : stack,
  });
};
