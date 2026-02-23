/**
 * WHY: CRUD Router Factory
LEARNING: Generic factory pattern for creating stand...
 */
import { Router } from 'express'
import { Model } from 'sequelize'
import { csrfProtection, checkOwnership } from '../../middlewares/security.js'
import type { CrudRouterConfig, CrudHandlerContext } from './crudRouterTypes.js'
import {
  createGetAllHandler,
  createGetByIdHandler,
  createPostHandler,
  createMutationHandler,
  createDeleteHandler,
} from './crudRouteHandlers.js'

export type { CrudErrorMessages, CrudRouterConfig } from './crudRouterTypes.js'

function buildHandlerContext<T extends Model>(config: CrudRouterConfig<T>): CrudHandlerContext<T> {
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
    constraintHandler,
  } = config
  return {
    model,
    resourceName,
    errorMessages,
    paramKey,
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
    constraintHandler,
  }
}

/**
 * Create a standardized CRUD router with optional lifecycle hooks
 *
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Config-driven router generation with optional hooks for domain-specific behavior
 *
 * @param config - CRUD router configuration
 * @returns Express router with standard CRUD routes
 */
export function createCrudRouter<T extends Model>(config: CrudRouterConfig<T>): Router {
  const router = Router()
  const context = buildHandlerContext(config)
  const paramKey = config.paramKey ?? 'id'

  const rawGetByIdMiddleware = config.getByIdMiddleware
  const getByIdMiddleware = rawGetByIdMiddleware !== undefined ? rawGetByIdMiddleware : []
  const getByIdHandler = config.customGetByIdHandler ?? createGetByIdHandler(context)
  router.get('/', config.customGetAllHandler ?? createGetAllHandler(context))
  router.get(`/:${paramKey}`, ...getByIdMiddleware, getByIdHandler)
  if (config.enablePost !== false) {
    router.post('/', csrfProtection, createPostHandler(context))
  }

  if (config.enablePut !== false) {
    router.put(
      `/:${paramKey}`,
      csrfProtection,
      checkOwnership(config.resourceName, paramKey),
      createMutationHandler(context, 'update')
    )
  }
  if (config.enablePatch !== false) {
    router.patch(
      `/:${paramKey}`,
      csrfProtection,
      checkOwnership(config.resourceName, paramKey),
      createMutationHandler(context, 'patch')
    )
  }
  if (config.enableDelete !== false) {
    router.delete(
      `/:${paramKey}`,
      csrfProtection,
      checkOwnership(config.resourceName, paramKey),
      createDeleteHandler(context)
    )
  }

  return router
}
