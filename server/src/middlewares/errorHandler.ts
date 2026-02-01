import { NextFunction, Response, Request } from "express";

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
