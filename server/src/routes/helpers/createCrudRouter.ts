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
 * import { ERROR_MESSAGES } from './myResourceConstants.js'
 * const router = createCrudRouter({
 *   model: MyModel,
 *   resourceName: 'myResource',
 *   errorMessages: {
 *     FETCH_ALL: ERROR_MESSAGES.FETCH_RESOURCES,
 *     FETCH_ONE: ERROR_MESSAGES.FETCH_RESOURCE,
 *     NOT_FOUND: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
 *     CREATE: ERROR_MESSAGES.CREATE_RESOURCE,
 *     UPDATE: ERROR_MESSAGES.UPDATE_RESOURCE,
 *     DELETE: ERROR_MESSAGES.DELETE_RESOURCE,
 *   }
 * })
 * ```
 */

import { Router, Request, Response } from 'express'
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
 * LEARNING: Factory function that generates Express router with all standard CRUD routes
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

  router.get('/', config.customGetAllHandler ?? createGetAllHandler(context))
  router.get(`/:${paramKey}`, config.customGetByIdHandler ?? createGetByIdHandler(context))
  router.post('/', csrfProtection, createPostHandler(context))

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
