/**
 * CRUD Route Handler Factories
 *
 * LEARNING: Extracted route handlers from createCrudRouter to reduce complexity and file size
 * WHY: Each handler is a small, testable unit; PUT and PATCH share one mutation handler
 * PATTERN: Factory functions that close over CrudHandlerContext and return Express route handlers
 */

import type { Request, Response } from 'express'
import type { Model } from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/types/utils.js'
import {
  fetchAll,
  fetchById,
  createRecord,
  updateRecord,
  patchRecord,
  deleteRecord,
} from './dataController.js'
import { handleRouteError } from './routerErrorHandler.js'
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
} from './routerResponseHelpers.js'
import type { CrudHandlerContext } from './crudRouterTypes.js'
import type { Includeable, Order } from 'sequelize'

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
      const id = req.params[paramKey]
      const record = await fetchById(model, id)
      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      const transformedRecord = transformResponse ? transformResponse(record) : record
      sendSuccess(res, transformedRecord)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessages.FETCH_ONE,
        `fetching ${resourceName}`,
        resourceName,
        req.params[paramKey],
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
      if (validateRequest) {
        const validation = validateRequest(req, 'create')
        if (!validation.valid) {
          const details = validation.details && 'message' in validation.details
            ? String(validation.details.message)
            : undefined
          sendBadRequest(res, validation.error, details)
          return
        }
      }
      if (beforeCreate) {
        await beforeCreate(req, res)
        if (res.headersSent) return
      }
      const data = sanitizeInput ? sanitizeInput(req.body, 'create') : req.body
      const record = await createRecord(model, data as MakeNullishOptional<T['_creationAttributes']>)
      if (afterCreate) {
        await afterCreate(record, req, res)
        if (res.headersSent) return
      }
      const transformedRecord = transformResponse ? transformResponse(record) : record
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

type MutationMethod = 'update' | 'patch'

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
      const id = req.params[paramKey]
      if (validateRequest) {
        const validation = validateRequest(req, validationMethod)
        if (!validation.valid) {
          const details = validation.details && 'message' in validation.details
            ? String(validation.details.message)
            : undefined
          sendBadRequest(res, validation.error, details, id)
          return
        }
      }
      if (beforeUpdate) {
        await beforeUpdate(req, res)
        if (res.headersSent) return
      }
      const data = sanitizeInput ? sanitizeInput(req.body, validationMethod) : req.body
      const updatedCount =
        method === 'update'
          ? await updateRecord(model, id, data as Partial<T['_creationAttributes']>)
          : await patchRecord(model, id, data as Partial<T['_creationAttributes']>)
      if (updatedCount === 0) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      const record = await fetchById(model, id)
      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      if (afterUpdate) {
        await afterUpdate(record, req, res)
        if (res.headersSent) return
      }
      const transformedRecord = transformResponse ? transformResponse(record) : record
      sendSuccess(res, transformedRecord)
    } catch (error) {
      handleRouteError(
        error,
        res,
        errorMessage,
        `${contextVerb} ${resourceName}`,
        resourceName,
        req.params[paramKey],
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
      const id = req.params[paramKey]
      const record = await fetchById(model, id)
      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }
      if (beforeDelete) {
        await beforeDelete(record, req, res)
        if (res.headersSent) return
      }
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
        req.params[paramKey],
        constraintHandler
      )
    }
  }
}
