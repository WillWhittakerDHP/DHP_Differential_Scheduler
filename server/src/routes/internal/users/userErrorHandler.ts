/**
 * User Router Error Handler
 * 
 */

import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { ERROR_MESSAGES } from './userConstants.js'

/**
 * Handle Sequelize validation errors
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
    ERROR_MESSAGES.VALIDATION_FAILED
  )
}

/**
 * Handle general errors with logging
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
