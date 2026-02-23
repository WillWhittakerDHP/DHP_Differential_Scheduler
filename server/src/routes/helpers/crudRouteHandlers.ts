/**
 * CRUD Route Handler Factories
 *
 */

import type { Request, Response } from 'express'
import type { Model } from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/types/utils.js'
import {
  fetchAll,
  fetchById,
  createRecord,
  deleteRecord,
} from './dataController.js'
import { handleRouteError } from './routerErrorHandler.js'
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
} from './routerResponseHelpers.js'
import type { CrudHandlerContext } from './crudRouterTypes.js'
import type { Includeable, Order } from 'sequelize'
import { paramString } from './requestHelpers.js'
import {
  runMutationValidation,
  performUpdateAndFetch,
  executeOptionalHook,
  handleValidationResult,
  applyOptionalTransform,
  type MutationMethod,
} from './crudHandlerHelpers.js'

type FetchAllOptions = {
  includes?: Includeable[]
  order?: Order
}

function buildFetchAllOptions<T extends Model>(context: CrudHandlerContext<T>): FetchAllOptions | undefined {
  const { defaultIncludes, defaultOrder } = context
  if (!defaultIncludes?.length && !defaultOrder) {
    return undefined
  }
  const options: FetchAllOptions = {}
  if (defaultIncludes && defaultIncludes.length > 0) {
    options.includes = defaultIncludes
  }
  if (defaultOrder) {
    options.order = (Array.isArray(defaultOrder) ? [...defaultOrder] : [defaultOrder]) as Order
  }
  return options
}

/**
 * GET / - List all resources
 */
export function createGetAllHandler<T extends Model>(
  context: CrudHandlerContext<T>
): (req: Request, res: Response) => Promise<void> {
  const { model, resourceName, errorMessages, transformResponse } = context
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const options = buildFetchAllOptions(context)
      const records = await fetchAll(model, options)
      const transformedRecords = transformResponse
        ? records.map((record) => transformResponse(record))
        : records
      sendSuccess(res, transformedRecords)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessages.FETCH_ALL,
        `fetching ${resourceName}s`,
        resourceName
      )
    }
  }
}

/**
 * GET /:id - Get single resource by ID
 */
export function createGetByIdHandler<T extends Model>(
  context: CrudHandlerContext<T>
): (req: Request, res: Response) => Promise<void> {
  const { model, resourceName, errorMessages, paramKey, transformResponse, constraintHandler } =
    context
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, paramKey)
      const record = await fetchById(model, id)
      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      const transformedRecord = applyOptionalTransform(record, transformResponse)
      sendSuccess(res, transformedRecord)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessages.FETCH_ONE,
        `fetching ${resourceName}`,
        resourceName,
        paramString(req, paramKey),
        constraintHandler
      )
    }
  }
}

/**
 * POST / - Create new resource
 */
export function createPostHandler<T extends Model>(
  context: CrudHandlerContext<T>
): (req: Request, res: Response) => Promise<void> {
  const {
    model,
    resourceName,
    errorMessages,
    validateRequest,
    beforeCreate,
    afterCreate,
    sanitizeInput,
    transformResponse,
    constraintHandler,
  } = context
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (validateRequest && !handleValidationResult(validateRequest(req, 'create'), res)) return
      if (
        !(await executeOptionalHook(
          beforeCreate as (...args: unknown[]) => Promise<void>,
          res,
          req
        ))
      )
        return
      const data = sanitizeInput ? sanitizeInput(req.body, 'create') : req.body
      const record = await createRecord(model, data as MakeNullishOptional<T['_creationAttributes']>)
      if (
        !(await executeOptionalHook(
          afterCreate as (...args: unknown[]) => Promise<void>,
          res,
          record,
          req,
          res
        ))
      )
        return
      const transformedRecord = applyOptionalTransform(record, transformResponse)
      sendCreated(res, transformedRecord)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessages.CREATE,
        `creating ${resourceName}`,
        resourceName,
        undefined,
        constraintHandler
      )
    }
  }
}

/**
 * PUT /:id and PATCH /:id - Full or partial update (unified handler)
 */
export function createMutationHandler<T extends Model>(
  context: CrudHandlerContext<T>,
  method: MutationMethod
): (req: Request, res: Response) => Promise<void> {
  const {
    model,
    resourceName,
    errorMessages,
    paramKey,
    validateRequest,
    beforeUpdate,
    afterUpdate,
    sanitizeInput,
    transformResponse,
    constraintHandler,
  } = context
  const validationMethod = method === 'update' ? 'update' : 'patch'
  const errorMessage = method === 'patch' ? (errorMessages.PATCH ?? errorMessages.UPDATE) : errorMessages.UPDATE
  const contextVerb = method === 'patch' ? 'patching' : 'updating'

  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, paramKey)
      if (!runMutationValidation(req, res, validateRequest, validationMethod, id)) return
      if (
        !(await executeOptionalHook(
          beforeUpdate as (...args: unknown[]) => Promise<void>,
          res,
          req
        ))
      )
        return
      const data = sanitizeInput ? sanitizeInput(req.body, validationMethod) : req.body
      const record = await performUpdateAndFetch(
        model,
        id,
        data as Partial<T['_creationAttributes']>,
        method,
        errorMessages,
        res
      )
      if (!record) return
      if (
        !(await executeOptionalHook(
          afterUpdate as (...args: unknown[]) => Promise<void>,
          res,
          record,
          req,
          res
        ))
      )
        return
      const transformedRecord = applyOptionalTransform(record, transformResponse)
      sendSuccess(res, transformedRecord)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessage,
        `${contextVerb} ${resourceName}`,
        resourceName,
        paramString(req, paramKey),
        constraintHandler
      )
    }
  }
}

/**
 * DELETE /:id - Delete resource
 */
export function createDeleteHandler<T extends Model>(
  context: CrudHandlerContext<T>
): (req: Request, res: Response) => Promise<void> {
  const { model, resourceName, errorMessages, paramKey, beforeDelete, constraintHandler } = context
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, paramKey)
      const record = await fetchById(model, id)
      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      if (
        !(await executeOptionalHook(
          beforeDelete as (...args: unknown[]) => Promise<void>,
          res,
          record,
          req,
          res
        ))
      )
        return
      const deletedCount = await deleteRecord(model, id)
      if (deletedCount === 0) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      sendNoContent(res)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessages.DELETE,
        `deleting ${resourceName}`,
        resourceName,
        paramString(req, paramKey),
        constraintHandler
      )
    }
  }
}
