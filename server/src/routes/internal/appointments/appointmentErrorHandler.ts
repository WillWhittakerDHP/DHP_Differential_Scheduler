/**
 * Appointment Router Error Handler
 * 
 * LEARNING: Centralized error handling utilities for appointment router operations
 * WHY: Eliminates console.error calls, provides consistent error responses, improves maintainability
 * PATTERN: Uses shared router error handlers (no domain-specific constraints needed)
 */

import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { VALIDATION_FAILED_MESSAGE } from '../../../constants/router.js'

/**
 * Handle Sequelize validation errors
 * LEARNING: Wrapper around shared error handler
 * WHY: Provides consistent error responses for validation failures
 * PATTERN: Delegates to shared handler
 * 
 * @param error - Error object (may be SequelizeValidationError or SequelizeUniqueConstraintError)
 * @param res - Express response object
 * @returns true if error was handled, false otherwise
 */
export function handleSequelizeValidationError(
  error: unknown,
  res: Response
): boolean {
  return sharedHandleSequelizeValidationError(
    error,
    res,
    VALIDATION_FAILED_MESSAGE
  )
}

/**
 * Handle general errors with logging
 * LEARNING: Wrapper around shared error handler
 * WHY: Eliminates console.error calls, provides consistent error responses
 * PATTERN: Delegates to shared handler
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return
 * @param context - Additional context for logging (e.g., operation name)
 */
export function handleGeneralError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string
): void {
  sharedHandleGeneralError(error, res, errorMessage, context)
}

/**
 * Handle route errors with comprehensive error handling
 * LEARNING: Wrapper around shared error handler
 * WHY: Provides consistent error handling across all routes
 * PATTERN: Delegates to shared handler (no domain-specific constraints)
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return
 * @param context - Additional context for logging (e.g., operation name)
 */
export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string
): void {
  sharedHandleRouteError(error, res, errorMessage, context)
}
