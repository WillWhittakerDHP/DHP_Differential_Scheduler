/**
 * Shared Router Error Handler
 * 
 * LEARNING: Centralized error handling utilities for all router operations
 * WHY: Eliminates duplication, provides consistent error responses across all routers
 * PATTERN: Generic error handlers that work for any router with optional domain-specific extensions
 */

import { Response } from 'express'
import { createLogger } from '../../utils/logger.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../constants/router.js'

const logger = createLogger('RouterErrorHandler')

/**
 * Handle Sequelize validation errors
 * LEARNING: Extracted Sequelize error handling logic
 * WHY: Provides consistent error responses for validation failures across all routers
 * PATTERN: Check error type, extract field errors, return structured response
 * 
 * @param error - Error object (may be SequelizeValidationError or SequelizeUniqueConstraintError)
 * @param res - Express response object
 * @param errorMessage - Error message to return (supports {displayName} placeholder)
 * @param displayName - Optional display name for entity-specific messages (replaces {displayName} in errorMessage)
 * @param entityId - Optional entity ID for error context
 * @returns true if error was handled, false otherwise
 */
export function handleSequelizeValidationError(
  error: unknown,
  res: Response,
  errorMessage: string,
  displayName?: string,
  entityId?: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  // Replace {displayName} placeholder if displayName is provided
  const finalErrorMessage = displayName 
    ? errorMessage.replace('{displayName}', displayName)
    : errorMessage

  // Handle SequelizeUniqueConstraintError
  if (error.name === 'SequelizeUniqueConstraintError') {
    const validationError = error as any
    const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field'
    const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : ''
    
    const response: any = {
      error: finalErrorMessage,
      details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
    }
    
    if (entityId) {
      response.id = entityId
    }
    
    res.status(400).json(response)
    return true
  }

  // Handle SequelizeValidationError
  if (error.name === 'SequelizeValidationError') {
    const validationError = error as any
    
    // Extract field errors from errors array
    if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
      const fieldErrors = validationError.errors.map((err: any) => {
        const fieldName = err.path || 'field'
        const message = err.message || 'Validation error'
        return `${fieldName}: ${message}`
      }).join('; ')
      
      const response: any = {
        error: finalErrorMessage,
        details: fieldErrors,
      }
      
      if (entityId) {
        response.id = entityId
      }
      
      res.status(400).json(response)
      return true
    }
    
    // Fallback to error message
    const response: any = {
      error: finalErrorMessage,
      details: error.message,
    }
    
    if (entityId) {
      response.id = entityId
    }
    
    res.status(400).json(response)
    return true
  }

  return false
}

/**
 * Handle general errors with logging
 * LEARNING: Centralized error logging and response generation
 * WHY: Eliminates console.error calls, provides consistent error responses
 * PATTERN: Log error with context, return structured error response
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return (supports {displayName} placeholder)
 * @param context - Additional context for logging (e.g., operation name)
 * @param displayName - Optional display name (replaces {displayName} in errorMessage)
 * @param entityId - Optional entity ID for error context
 */
export function handleGeneralError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string,
  displayName?: string,
  entityId?: string
): void {
  logger.error(`Error ${context}:`, error)
  
  const finalMessage = displayName 
    ? errorMessage.replace('{displayName}', displayName)
    : errorMessage
  
  const response: any = {
    error: finalMessage,
    details: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
  }
  
  if (entityId) {
    response.id = entityId
  }
  
  res.status(500).json(response)
}

/**
 * Handle route errors with comprehensive error handling
 * LEARNING: Unified error handler that tries all error handling strategies
 * WHY: Provides consistent error handling across all routes
 * PATTERN: Try Sequelize errors first, then constraint errors (if provided), then general errors
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param errorMessage - Error message to return (supports {displayName} placeholder)
 * @param context - Additional context for logging (e.g., operation name)
 * @param displayName - Optional display name (replaces {displayName} in errorMessage)
 * @param entityId - Optional entity ID for error context
 * @param constraintHandler - Optional domain-specific constraint handler function
 */
export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string,
  displayName?: string,
  entityId?: string,
  constraintHandler?: (error: unknown, res: Response, entityId?: string) => boolean
): void {
  // Try Sequelize validation errors first
  if (handleSequelizeValidationError(error, res, errorMessage, displayName, entityId)) {
    return
  }

  // Try domain-specific constraint errors if handler provided
  if (constraintHandler && constraintHandler(error, res, entityId)) {
    return
  }

  // Fallback to general error handling
  handleGeneralError(error, res, errorMessage, context, displayName, entityId)
}
