/**
 * Request body validation middleware using Joi.
 * Validates req.body against a schema; returns 400 with details on failure.
 * Does not wire to any route by default — use per-route.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AnySchema } from 'joi';

/**
 * Returns Express middleware that validates req.body against the given Joi schema.
 * On validation failure: responds 400 with { error, details } and does not call next().
 * On success: calls next().
 *
 * WHY: Centralizes body validation with consistent error shape (error + details).
 * PATTERN: Same validation approach as relationshipAnnotationAssignmentRouter, extracted
 * into reusable middleware so routes stay thin.
 *
 * @param schema - Joi schema (ObjectSchema or ArraySchema) to validate req.body
 * @returns Express RequestHandler
 */
export function validateRequest(schema: AnySchema): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
      return;
    }
    next();
  };
}
