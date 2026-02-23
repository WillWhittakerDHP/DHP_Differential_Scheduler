
import { Response } from 'express'
import { createLogger } from '../../utils/logger.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../constants/router.js'

const logger = createLogger('RouterErrorHandler')

/** Sequelize validation error with optional fields/errors (runtime shape) */
interface SequelizeValidationErrorShape {
  name?: string
  fields?: Record<string, unknown>
  errors?: Array<{ path?: string; message?: string }>
}

/** JSON error response body */
interface ErrorResponseBody {
  error: string
  details: string
  id?: string
}

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

  const finalErrorMessage = displayName 
    ? errorMessage.replace('{displayName}', displayName)
    : errorMessage

  if (error.name === 'SequelizeUniqueConstraintError') {
    const validationError = error as SequelizeValidationErrorShape
    const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field'
    const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : ''
    
    const response: ErrorResponseBody = {
      error: finalErrorMessage,
      details: `${fieldName} "${String(fieldValue)}" already exists. Please use a unique value.`,
    }
    
    if (entityId) {
      response.id = entityId
    }
    
    res.status(400).json(response)
    return true
  }

  if (error.name === 'SequelizeValidationError') {
    const validationError = error as SequelizeValidationErrorShape
    
    if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
      const fieldErrors = validationError.errors.map((err: { path?: string; message?: string }) => {
        const fieldName = err.path || 'field'
        const message = err.message || 'Validation error'
        return `${fieldName}: ${message}`
      }).join('; ')
      
      const response: ErrorResponseBody = {
        error: finalErrorMessage,
        details: fieldErrors,
      }
      
      if (entityId) {
        response.id = entityId
      }
      
      res.status(400).json(response)
      return true
    }
    
    const response: ErrorResponseBody = {
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
  
  const response: ErrorResponseBody = {
    error: finalMessage,
    details: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
  }
  
  if (entityId) {
    response.id = entityId
  }
  
  res.status(500).json(response)
}

export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string,
  displayName?: string,
  entityId?: string,
  constraintHandler?: (error: unknown, res: Response, entityId?: string) => boolean
): void {
  if (handleSequelizeValidationError(error, res, errorMessage, displayName, entityId)) {
    return
  }

  // Try domain-specific constraint errors if handler provided
  if (constraintHandler && constraintHandler(error, res, entityId)) {
    return
  }

  handleGeneralError(error, res, errorMessage, context, displayName, entityId)
}
