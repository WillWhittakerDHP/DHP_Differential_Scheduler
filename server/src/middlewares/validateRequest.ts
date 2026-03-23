/**
 * Request body validation middleware using Joi.
 * Validates req.body against a schema; returns 400 with details on failure.
 * Does not wire to any route by default — use per-route.
 */

import type { Request, Response, NextFunction } from 'express';
import type { Schema } from 'joi';

import { ERROR_MESSAGES } from '../routes/internal/users/userConstants.js';

/**
 * Returns Express middleware that validates req.body against the given Joi schema.
 * On validation failure: responds 400 with { error, details } and does not call next().
 * On success: calls next().
 *
 * PATTERN: Same validation approach as relationshipAnnotationAssignmentRouter, extracted
 * into reusable middleware so routes stay thin.
 *
 * WHY Schema: Accepts ObjectSchema (typical POST/PUT bodies) and ArraySchema
 * (bulk routes like PATCH /entities/:type/order_index) — schema.validate() works for both.
 *
 * @param schema - Joi Schema (ObjectSchema or ArraySchema) to validate req.body
 * @returns Express RequestHandler
 */
export function validateRequest(schema: Schema): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_FAILED,
        details: error.details,
      });
      return;
    }
    next();
  };
}
