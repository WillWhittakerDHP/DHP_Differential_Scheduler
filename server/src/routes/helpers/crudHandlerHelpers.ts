
import type { Request, Response } from 'express'
import type { Model } from 'sequelize'
import { fetchById, updateRecord, patchRecord } from './dataController.js'
import { sendNotFound, sendBadRequest } from './routerResponseHelpers.js'
import type { CrudHandlerContext } from './crudRouterTypes.js'
import type { ValidationResult } from './routerValidators.js'

export type MutationMethod = 'update' | 'patch'

/**
 * WHY: Execute an optional async hook; returns false if response was already se...
 */
export async function executeOptionalHook(
  hook: ((...args: unknown[]) => Promise<void>) | undefined,
  res: Response,
  ...args: unknown[]
): Promise<boolean> {
  if (!hook) return true
  await hook(...args)
  return !res.headersSent
}

export function handleValidationResult(
  validation: ValidationResult,
  res: Response,
  entityId?: string
): boolean {
  if (validation.valid) return true
  const details =
    validation.details && 'message' in validation.details
      ? String(validation.details.message)
      : undefined
  sendBadRequest(res, validation.error, details, entityId)
  return false
}

export function applyOptionalTransform<T, R = T>(
  value: T,
  transform?: (value: T) => R
): T | R {
  return (transform ? transform(value) : value) as T | R
}

/** Run mutation validation; returns false if invalid (and sends response). */
export function runMutationValidation(
  req: Request,
  res: Response,
  validateRequest: CrudHandlerContext<Model>['validateRequest'],
  validationMethod: 'update' | 'patch',
  id: string
): boolean {
  if (!validateRequest) return true
  return handleValidationResult(validateRequest(req, validationMethod), res, id)
}

/** Perform update or patch and fetch record; returns null if not found (and sends response). */
export async function performUpdateAndFetch<T extends Model>(
  model: CrudHandlerContext<T>['model'],
  id: string,
  data: Partial<T['_creationAttributes']>,
  method: MutationMethod,
  errorMessages: CrudHandlerContext<T>['errorMessages'],
  res: Response
): Promise<T | null> {
  const updatedCount =
    method === 'update'
      ? await updateRecord(model, id, data)
      : await patchRecord(model, id, data)
  if (updatedCount === 0) {
    sendNotFound(res, errorMessages.NOT_FOUND, id)
    return null
  }
  const record = await fetchById(model, id)
  if (!record) {
    sendNotFound(res, errorMessages.NOT_FOUND, id)
    return null
  }
  return record
}
