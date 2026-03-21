import { Response } from 'express'
import { isProduction } from '../../../utils/envHelpers.js'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { SEQUELIZE_ERROR_CODES, ERROR_MESSAGES } from './relationshipConstants.js'
import { VALIDATION_FAILED_MESSAGE } from '../../../constants/router.js'

function handleUniqueConstraintError(
  error: unknown,
  res: Response,
  displayName: string,
  relationshipType: string,
  parentId: string,
  childId: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const parentCode = (error as { parent?: { code?: string } }).parent?.code
  if (error.name === 'SequelizeUniqueConstraintError' || parentCode === SEQUELIZE_ERROR_CODES.UNIQUE_CONSTRAINT) {
    res.status(409).json({
      error: ERROR_MESSAGES.RELATIONSHIP_ALREADY_EXISTS,
      details: `This ${displayName} relationship already exists`,
      relationshipType,
      parentId,
      childId,
    })
    return true
  }

  return false
}

function handleForeignKeyConstraintError(
  error: unknown,
  res: Response,
  relationshipType: string,
  parentId: string,
  childId: string
): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const parentCode = (error as { parent?: { code?: string } }).parent?.code
  if (error.name === 'SequelizeForeignKeyConstraintError' || parentCode === SEQUELIZE_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) {
    const details = isProduction() ? 'One of the referenced entities does not exist' : (error.message || 'One of the referenced entities does not exist');
    res.status(400).json({
      error: ERROR_MESSAGES.INVALID_ENTITY_REFERENCE,
      details,
      relationshipType,
      parentId,
      childId,
    });
    return true
  }

  return false
}

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
  context: string,
  displayName?: string,
  relationshipType?: string,
  parentId?: string,
  childId?: string
): void {
  // Try unique constraint errors first
  if (displayName && relationshipType && parentId && childId) {
    if (handleUniqueConstraintError(error, res, displayName, relationshipType, parentId, childId)) {
      return
    }
    
    if (handleForeignKeyConstraintError(error, res, relationshipType, parentId, childId)) {
      return
    }
  }
  
  sharedHandleRouteError(error, res, errorMessage, context)
}
