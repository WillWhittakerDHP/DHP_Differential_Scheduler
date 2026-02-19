/**
 * Shared admin metadata error handling
 *
 * LEARNING: Single implementation for admin-metadata, admin-primitive-metadata, admin-relationship-metadata
 * WHY: All three routers use identical error handling; dedupe for maintainability
 * PATTERN: Re-export wrappers around shared router error handlers
 */

import type { Response } from 'express'
import {
  handleSequelizeValidationError as sharedHandleSequelizeValidationError,
  handleGeneralError as sharedHandleGeneralError,
  handleRouteError as sharedHandleRouteError,
} from './routerErrorHandler.js'
import { VALIDATION_FAILED_MESSAGE } from '../../constants/router.js'

export function handleSequelizeValidationError(error: unknown, res: Response): boolean {
  return sharedHandleSequelizeValidationError(error, res, VALIDATION_FAILED_MESSAGE)
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
  sharedHandleRouteError(error, res, errorMessage, context)
}
