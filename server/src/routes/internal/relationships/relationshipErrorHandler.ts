/**
 * Relationship Router Error Handler
 * 
 */

import { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from '../../helpers/routerErrorHandler.js'
import { SEQUELIZE_ERROR_CODES, ERROR_MESSAGES } from './relationshipConstants.js'
import { VALIDATION_FAILED_MESSAGE } from '../../../constants/router.js'

/**
 * Handle Sequelize unique constraint errors
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param displayName - Display name of the relationship type
 * @param relationshipType - Relationship type
 * @param parentId - Parent ID
 * @param childId - Child ID
 * @returns true if error was handled, false otherwise
 */
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

/**
 * Handle Sequelize foreign key constraint errors
 * 
 * @param error - Error object
 * @param res - Express response object
 * @param relationshipType - Relationship type
 * @param parentId - Parent ID
 * @param childId - Child ID
 * @returns true if error was handled, false otherwise
 */
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
    res.status(400).json({
      error: ERROR_MESSAGES.INVALID_ENTITY_REFERENCE,
      details: error.message || 'One of the referenced entities does not exist',
      relationshipType,
      parentId,
      childId,
    })
    return true
  }

  return false
}

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
    VALIDATION_FAILED_MESSAGE
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
 * @param displayName - Display name of the relationship type
 * @param relationshipType - Relationship type
 * @param parentId - Parent ID (optional)
 * @param childId - Child ID (optional)
 */
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
