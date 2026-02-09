/**
 * Entity Router Error Handler
 * 
 * LEARNING: Centralized error handling utilities for entity router operations
 * WHY: Eliminates console.error calls, provides consistent error responses, improves maintainability
 * PATTERN: Uses shared router error handlers with domain-specific constraint handling
 */

import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { ERROR_MESSAGES, CONSTRAINT_NAMES, ERROR_CODES } from './entityConstants.js'

/**
 * Handle Sequelize validation errors
 * LEARNING: Wrapper around shared error handler with entity-specific error message
 * WHY: Provides consistent error responses for validation failures
 * PATTERN: Delegates to shared handler with entity-specific error message template
 * 
 * @param error - Error object (may be SequelizeValidationError or SequelizeUniqueConstraintError)
 * @param res - Express response object
 * @param displayName - Display name of the entity type
 * @param entityId - Optional entity ID for error context
 * @returns true if error was handled, false otherwise
 */
export function handleSequelizeValidationError(
  error: unknown,
  res: Response,
  displayName: string,
  entityId?: string
): boolean {
  return sharedHandleSequelizeValidationError(
    error,
    res,
    ERROR_MESSAGES.VALIDATION_FAILED,
    displayName,
    entityId
  )
}

/**
 * Handle database constraint violations
 * LEARNING: Extracted database constraint error handling logic
 * WHY: Provides consistent error responses for constraint violations
 * PATTERN: Check error message for specific constraint violations, return appropriate response
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param entityId - Entity ID for error context
 * @returns true if error was handled, false otherwise
 */
export function handleDatabaseConstraintError(
  error: unknown,
  res: Response,
  entityId?: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  // Handle mutual exclusivity constraint violation
  if ('parent' in error &&
      error.parent &&
      typeof error.parent === 'object' &&
      'code' in error.parent &&
      error.parent.code === ERROR_CODES.CHECK_VIOLATION) {
    // Check if it's the state control mutual exclusivity constraint
    if ('constraint' in error.parent && 
        error.parent.constraint === CONSTRAINT_NAMES.STATE_CONTROL_MUTUAL_EXCLUSIVITY) {
      const response: any = {
        error: ERROR_MESSAGES.MUTUAL_EXCLUSIVITY_VIOLATION,
        message: ERROR_MESSAGES.MUTUAL_EXCLUSIVITY_MESSAGE,
        details: ERROR_MESSAGES.MUTUAL_EXCLUSIVITY_DETAILS,
      }
      
      if (entityId) {
        response.id = entityId
      }
      
      res.status(400).json(response)
      return true
    }
  }

  return false
}

/**
 * Handle general errors with logging
 * LEARNING: Wrapper around shared error handler with entity-specific context
 * WHY: Eliminates console.error calls, provides consistent error responses
 * PATTERN: Delegates to shared handler with entity-specific error message template
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return (with {displayName} placeholder)
 * @param displayName - Display name of the entity type
 * @param context - Additional context for logging (e.g., operation name)
 * @param entityId - Optional entity ID for error context
 */
export function handleGeneralError(
  error: unknown,
  res: Response,
  errorMessage: string,
  displayName: string,
  context: string,
  entityId?: string
): void {
  sharedHandleGeneralError(error, res, errorMessage, context, displayName, entityId)
}

/**
 * Handle route errors with comprehensive error handling
 * LEARNING: Wrapper around shared error handler with entity-specific constraint handling
 * WHY: Provides consistent error handling across all routes
 * PATTERN: Delegates to shared handler with domain-specific constraint handler
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return (with {displayName} placeholder)
 * @param displayName - Display name of the entity type
 * @param context - Additional context for logging (e.g., operation name)
 * @param entityId - Optional entity ID for error context
 */
export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  displayName: string,
  context: string,
  entityId?: string
): void {
  sharedHandleRouteError(
    error,
    res,
    errorMessage,
    context,
    displayName,
    entityId,
    handleDatabaseConstraintError
  )
}
