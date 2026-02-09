/**
 * CRUD Router Factory
 * 
 * LEARNING: Generic factory pattern for creating standardized CRUD routers
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Config-driven router generation with optional lifecycle hooks for domain-specific behavior
 * 
 * This follows the same "generic pattern with runtime config" approach used in entityRegistry.ts
 * 
 * @example
 * ```typescript
 * const userRouter = createCrudRouter({
 *   model: User,
 *   resourceName: 'user',
 *   errorMessages: {
 *     FETCH_ALL: 'Failed to fetch users',
 *     FETCH_ONE: 'Error fetching user',
 *     NOT_FOUND: 'User not found',
 *     CREATE: 'Failed to create user',
 *     UPDATE: 'Failed to update user',
 *     DELETE: 'Failed to delete user',
 *   }
 * })
 * ```
 */

import { Router, Request, Response, NextFunction } from 'express'
import { Model, ModelStatic, Includeable, Order } from 'sequelize'
import {
  fetchAll,
  fetchById,
  createRecord,
  updateRecord,
  patchRecord,
  deleteRecord
} from './dataController.js'
import { handleRouteError } from './routerErrorHandler.js'
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest
} from './routerResponseHelpers.js'
import { csrfProtection, checkOwnership } from '../../middlewares/security.js'
import { HTTP_STATUS_CODES } from '../../constants/router.js'
import { ValidationResult } from './routerValidators.js'

/**
 * Error messages configuration for CRUD operations
 */
export interface CrudErrorMessages {
  FETCH_ALL: string
  FETCH_ONE: string
  NOT_FOUND: string
  CREATE: string
  UPDATE: string
  PATCH?: string
  DELETE: string
}

/**
 * CRUD Router Configuration
 */
export interface CrudRouterConfig<T extends Model> {
  /** Sequelize model for CRUD operations */
  model: ModelStatic<T>
  
  /** Resource name for error messages (e.g., 'user', 'appointment') */
  resourceName: string
  
  /** Error messages for all CRUD operations */
  errorMessages: CrudErrorMessages
  
  /** Parameter key for ID lookups (defaults to 'id', can be 'key' for settings) */
  paramKey?: string
  
  /** Lifecycle hooks (all optional) */
  beforeCreate?: (req: Request, res: Response) => Promise<void>
  afterCreate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeUpdate?: (req: Request, res: Response) => Promise<void>
  afterUpdate?: (record: T, req: Request, res: Response) => Promise<void>
  beforeDelete?: (record: T, req: Request, res: Response) => Promise<void>
  
  /** Data transformation */
  transformResponse?: (record: T) => unknown
  sanitizeInput?: (data: unknown, method: 'create' | 'update' | 'patch') => unknown
  
  /** Request validation */
  validateRequest?: (req: Request, method: 'create' | 'update' | 'patch') => ValidationResult
  
  /** Query customization */
  defaultIncludes?: Includeable[]
  defaultOrder?: Order
  
  /** Feature flags */
  enablePut?: boolean
  enablePatch?: boolean
  enableDelete?: boolean
  
  /** Custom constraint error handler (optional) */
  constraintHandler?: (error: unknown, res: Response, entityId?: string) => boolean
  
  /** Custom GET / handler (optional - if provided, overrides default GET /) */
  customGetAllHandler?: (req: Request, res: Response) => Promise<void>
  
  /** Custom GET /:id handler (optional - if provided, overrides default GET /:id) */
  customGetByIdHandler?: (req: Request, res: Response) => Promise<void>
}

/**
 * Create a standardized CRUD router with optional lifecycle hooks
 * 
 * LEARNING: Factory function that generates Express router with all standard CRUD routes
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Config-driven router generation with optional hooks for domain-specific behavior
 * 
 * @param config - CRUD router configuration
 * @returns Express router with standard CRUD routes
 */
export function createCrudRouter<T extends Model>(config: CrudRouterConfig<T>): Router {
  const {
    model,
    resourceName,
    errorMessages,
    paramKey = 'id',
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDelete,
    transformResponse,
    sanitizeInput,
    validateRequest,
    defaultIncludes,
    defaultOrder,
    enablePut = true,
    enablePatch = true,
    enableDelete = true,
    constraintHandler,
    customGetAllHandler,
    customGetByIdHandler
  } = config

  const router = Router()

  /**
   * GET / - List all resources
   */
  router.get('/', async (req: Request, res: Response): Promise<void> => {
    // Use custom handler if provided
    if (customGetAllHandler) {
      await customGetAllHandler(req, res)
      return
    }
    
    try {
      const options: {
        includes?: any[]
        attributes?: string[]
        order?: any[]
      } = {}

      if (defaultIncludes && defaultIncludes.length > 0) {
        options.includes = defaultIncludes as any[]
      }

      if (defaultOrder) {
        // Convert Order (which can be array or single item) to array format
        // Order type from Sequelize can be OrderItem[] or OrderItem
        // fetchAll expects any[], so ensure we always pass an array
        options.order = Array.isArray(defaultOrder) 
          ? (defaultOrder as any[])
          : [defaultOrder as any]
      }

      const records = await fetchAll(model, options)
      
      // Transform responses if transform function provided
      const transformedRecords = transformResponse
        ? records.map(record => transformResponse(record))
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
  })

  /**
   * GET /:id - Get single resource by ID
   */
  router.get(`/:${paramKey}`, async (req: Request, res: Response): Promise<void> => {
    // Use custom handler if provided
    if (customGetByIdHandler) {
      await customGetByIdHandler(req, res)
      return
    }
    
    try {
      const id = req.params[paramKey]
      const record = await fetchById(model, id)

      if (!record) {
        sendNotFound(res, errorMessages.NOT_FOUND, id)
        return
      }

      // Transform response if transform function provided
      const transformedRecord = transformResponse
        ? transformResponse(record)
        : record

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
  })

  /**
   * POST / - Create new resource
   */
  router.post(
    '/',
    csrfProtection, // Security middleware: CSRF protection
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Validate request if validator provided
        if (validateRequest) {
          const validation = validateRequest(req, 'create')
          if (!validation.valid) {
            sendBadRequest(res, validation.error, validation.details?.message as string)
            return
          }
        }

        // Run beforeCreate hook if provided
        if (beforeCreate) {
          await beforeCreate(req, res)
          // If beforeCreate sent a response, stop here
          if (res.headersSent) {
            return
          }
        }

        // Sanitize input if sanitizer provided
        const data = sanitizeInput
          ? sanitizeInput(req.body, 'create')
          : req.body

        // Create record
        const record = await createRecord(model, data as any)

        // Run afterCreate hook if provided
        if (afterCreate) {
          await afterCreate(record, req, res)
          // If afterCreate sent a response, stop here
          if (res.headersSent) {
            return
          }
        }

        // Transform response if transform function provided
        const transformedRecord = transformResponse
          ? transformResponse(record)
          : record

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
  )

  /**
   * PUT /:id - Full update resource
   */
  if (enablePut) {
    router.put(
      `/:${paramKey}`,
      csrfProtection, // Security middleware: CSRF protection
      checkOwnership(resourceName, paramKey), // Security middleware: ownership check (stub)
      async (req: Request, res: Response): Promise<void> => {
        try {
          const id = req.params[paramKey]

          // Validate request if validator provided
          if (validateRequest) {
            const validation = validateRequest(req, 'update')
            if (!validation.valid) {
              sendBadRequest(res, validation.error, validation.details?.message as string, id)
              return
            }
          }

          // Run beforeUpdate hook if provided
          if (beforeUpdate) {
            await beforeUpdate(req, res)
            // If beforeUpdate sent a response, stop here
            if (res.headersSent) {
              return
            }
          }

          // Sanitize input if sanitizer provided
          const data = sanitizeInput
            ? sanitizeInput(req.body, 'update')
            : req.body

          // Update record
          const updatedCount = await updateRecord(model, id, data as any)

          if (updatedCount === 0) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Fetch updated record
          const record = await fetchById(model, id)
          if (!record) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Run afterUpdate hook if provided
          if (afterUpdate) {
            await afterUpdate(record, req, res)
            // If afterUpdate sent a response, stop here
            if (res.headersSent) {
              return
            }
          }

          // Transform response if transform function provided
          const transformedRecord = transformResponse
            ? transformResponse(record)
            : record

          sendSuccess(res, transformedRecord)
        } catch (error) {
          handleRouteError(
            error,
            res,
            errorMessages.UPDATE,
            `updating ${resourceName}`,
            resourceName,
            req.params[paramKey],
            constraintHandler
          )
        }
      }
    )
  }

  /**
   * PATCH /:id - Partial update resource
   */
  if (enablePatch) {
    router.patch(
      `/:${paramKey}`,
      csrfProtection, // Security middleware: CSRF protection
      checkOwnership(resourceName, paramKey), // Security middleware: ownership check (stub)
      async (req: Request, res: Response): Promise<void> => {
        try {
          const id = req.params[paramKey]

          // Validate request if validator provided
          if (validateRequest) {
            const validation = validateRequest(req, 'patch')
            if (!validation.valid) {
              sendBadRequest(res, validation.error, validation.details?.message as string, id)
              return
            }
          }

          // Run beforeUpdate hook if provided (PATCH uses same hook as PUT)
          if (beforeUpdate) {
            await beforeUpdate(req, res)
            // If beforeUpdate sent a response, stop here
            if (res.headersSent) {
              return
            }
          }

          // Sanitize input if sanitizer provided
          const data = sanitizeInput
            ? sanitizeInput(req.body, 'patch')
            : req.body

          // Patch record
          const updatedCount = await patchRecord(model, id, data as any)

          if (updatedCount === 0) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Fetch updated record
          const record = await fetchById(model, id)
          if (!record) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Run afterUpdate hook if provided (PATCH uses same hook as PUT)
          if (afterUpdate) {
            await afterUpdate(record, req, res)
            // If afterUpdate sent a response, stop here
            if (res.headersSent) {
              return
            }
          }

          // Transform response if transform function provided
          const transformedRecord = transformResponse
            ? transformResponse(record)
            : record

          sendSuccess(res, transformedRecord)
        } catch (error) {
          const patchError = errorMessages.PATCH || errorMessages.UPDATE
          handleRouteError(
            error,
            res,
            patchError,
            `patching ${resourceName}`,
            resourceName,
            req.params[paramKey],
            constraintHandler
          )
        }
      }
    )
  }

  /**
   * DELETE /:id - Delete resource
   */
  if (enableDelete) {
    router.delete(
      `/:${paramKey}`,
      csrfProtection, // Security middleware: CSRF protection
      checkOwnership(resourceName, paramKey), // Security middleware: ownership check (stub)
      async (req: Request, res: Response): Promise<void> => {
        try {
          const id = req.params[paramKey]

          // Fetch record before delete (for beforeDelete hook)
          const record = await fetchById(model, id)

          if (!record) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Run beforeDelete hook if provided
          if (beforeDelete) {
            await beforeDelete(record, req, res)
            // If beforeDelete sent a response, stop here
            if (res.headersSent) {
              return
            }
          }

          // Delete record
          const deletedCount = await deleteRecord(model, id)

          if (deletedCount === 0) {
            sendNotFound(res, errorMessages.NOT_FOUND, id)
            return
          }

          // Standard DELETE response: 204 No Content
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
    )
  }

  return router
}
