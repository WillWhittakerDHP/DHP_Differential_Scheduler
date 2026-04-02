
import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { ERROR_MESSAGES, CONSTRAINT_NAMES } from './entityConstants.js'

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

function handleDatabaseConstraintError(
  error: unknown,
  res: Response,
  entityId?: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

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
    if (
      constraint === CONSTRAINT_NAMES.PART_INSTANCES_PART_SHAPE_REF_FKEY ||
      constraint === CONSTRAINT_NAMES.VALID_PART_CASCADES_CHILD_ID_FKEY ||
      constraint === CONSTRAINT_NAMES.VALID_PRICING_CASCADES_PARENT_ID_FKEY ||
      constraint === CONSTRAINT_NAMES.VALID_PRICING_CASCADES_CHILD_ID_FKEY
    ) {
      res.status(409).json({
        error: ERROR_MESSAGES.PART_SHAPE_IN_USE,
        details: ERROR_MESSAGES.PART_SHAPE_IN_USE_DETAILS_RACE,
        shapeId: entityId,
      })
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
