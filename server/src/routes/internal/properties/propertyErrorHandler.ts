
import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { ERROR_MESSAGES } from './propertyConstants.js'

export function handleSequelizeValidationError(
  error: unknown,
  res: Response,
  defaultMessage: string
): boolean {
  return sharedHandleSequelizeValidationError(error, res, defaultMessage)
}

function handleDatabaseConstraintError(
  error: unknown,
  res: Response,
  _entityId?: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  // Handle block_shape validation constraint
  if (error.message.includes('block_instance_id must reference')) {
    res.status(400).json({
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPE,
      details: error.message
    })
    return true
  }

  // Handle unique constraint violation (duplicate key)
  if (error.message.includes('duplicate key')) {
    res.status(409).json({
      error: ERROR_MESSAGES.CREATE_PROPERTY
    })
    return true
  }

  return false
}

export function handleGeneralError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string
): void {
  sharedHandleGeneralError(error, res, errorMessage, context)
}

export function handleRouteError(
  error: unknown,
  res: Response,
  errorMessage: string,
  context: string
): void {
  // Create a wrapper constraint handler that uses the errorMessage
  const constraintHandler = (err: unknown, response: Response, entityId?: string): boolean => {
    return handleDatabaseConstraintError(err, response, entityId)
  }
  
  sharedHandleRouteError(
    error,
    res,
    errorMessage,
    context,
    undefined, // displayName not used for properties
    undefined, // entityId not used for properties
    constraintHandler
  )
}
