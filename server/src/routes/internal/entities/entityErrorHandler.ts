
import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { ERROR_MESSAGES, CONSTRAINT_NAMES, ERROR_CODES } from './entityConstants.js'

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

export function handleDatabaseConstraintError(
  error: unknown,
  res: Response,
  entityId?: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  // Annotation shape DELETE: FK still enforced if instances reference shape (e.g. race after pre-count)
  if (error.name === 'SequelizeForeignKeyConstraintError' && entityId) {
    const parent = (error as { parent?: { constraint?: string } }).parent
    const constraint = parent?.constraint
    if (constraint === CONSTRAINT_NAMES.ANNOTATION_INSTANCES_TYPE_FKEY) {
      res.status(409).json({
        error: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE,
        details: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE_DETAILS_RACE,
        shapeId: entityId,
      })
      return true
    }
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
      const response: { error: string; message: string; details: string; id?: string } = {
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
