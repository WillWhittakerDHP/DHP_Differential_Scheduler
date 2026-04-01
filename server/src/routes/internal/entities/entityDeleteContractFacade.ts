/**
 * Dependency-aware delete contract handlers (preflight / resolve / finalize).
 * Delegates to `getDependencyDeleteStrategy` + in-memory preflight tokens (see token store JSDoc).
 */

import type { Request, Response } from 'express'
import type {
  DeleteFinalizeRequest,
  DeleteResolutionAction,
  DeleteResolveRequest,
} from '@shared/types/adminDeleteDependency.js'
import { sequelize } from '../../../config/app.js'
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { validateEntityId } from './entityValidators.js'
import { handleRouteError } from './entityErrorHandler.js'
import { sendDeleteContractError } from './entityDeleteContractResponse.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { getDependencyDeleteStrategy } from '../../../services/entityDelete/dependencyDeleteRegistry.js'
import {
  issueDeleteContractPreflightToken,
  getDeleteContractPreflightToken,
  consumeDeleteContractPreflightToken,
} from '../../../services/entityDelete/deleteContractPreflightTokenStore.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('EntityDeleteContract')

const NOT_REGISTERED_DETAILS =
  'Dependency-aware delete is not registered for this entity type yet.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type EntityRouteContext = {
  entityConfig: NonNullable<Request['entityConfig']>
  entityId: string
  entityType: string
}

function readEntityRouteContext(req: Request, res: Response): EntityRouteContext | null {
  const { entityConfig } = req
  if (!entityConfig) {
    sendDeleteContractError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, {
      error: ERROR_MESSAGES.ENTITY_CONFIG_MISSING,
      code: 'INTERNAL',
    })
    return null
  }

  const entityId = paramString(req, 'id')
  const entityType = paramString(req, 'entityType')
  const idValidation = validateEntityId(entityId, entityConfig.displayName)
  if (!idValidation.valid) {
    sendBadRequest(
      res,
      idValidation.error,
      idValidation.details?.details as string | undefined,
      entityId
    )
    return null
  }

  return { entityConfig, entityId, entityType }
}

function parseResolutions(raw: unknown): DeleteResolutionAction[] | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const resolutions: DeleteResolutionAction[] = []
  for (const item of raw) {
    if (!isRecord(item) || typeof item.type !== 'string') {
      return null
    }
    if (item.type === 'noop') {
      resolutions.push({ type: 'noop' })
      continue
    }
    if (item.type === 'reassign') {
      const edgeId = item.edgeId
      const targetEntityId = item.targetEntityId
      if (typeof edgeId !== 'string' || typeof targetEntityId !== 'string') {
        return null
      }
      resolutions.push({ type: 'reassign', edgeId, targetEntityId })
      continue
    }
    if (item.type === 'confirm_bulk_remove') {
      const edgeId = item.edgeId
      if (typeof edgeId !== 'string') {
        return null
      }
      resolutions.push({ type: 'confirm_bulk_remove', edgeId })
      continue
    }
    return null
  }
  return resolutions
}

function parseDeleteResolveBody(body: Record<string, unknown>): DeleteResolveRequest | null {
  const entityType = body.entityType
  const entityId = body.entityId
  if (typeof entityType !== 'string' || typeof entityId !== 'string') {
    return null
  }
  const resolutions = parseResolutions(body.resolutions)
  if (resolutions === null) {
    return null
  }
  const preflightToken = body.preflightToken
  if (typeof preflightToken !== 'string' || preflightToken === '') {
    return null
  }
  return {
    entityType,
    entityId,
    preflightToken,
    resolutions,
  }
}

function parseDeleteFinalizeBody(body: Record<string, unknown>): DeleteFinalizeRequest | null {
  const entityType = body.entityType
  const entityId = body.entityId
  if (typeof entityType !== 'string' || typeof entityId !== 'string') {
    return null
  }
  const preflightToken = body.preflightToken
  if (typeof preflightToken !== 'string' || preflightToken === '') {
    return null
  }
  const resolveToken = body.resolveToken
  return {
    entityType,
    entityId,
    preflightToken,
    resolveToken: typeof resolveToken === 'string' ? resolveToken : undefined,
  }
}

export async function handleDeleteContractPreflight(req: Request, res: Response): Promise<void> {
  try {
    const ctx = readEntityRouteContext(req, res)
    if (ctx === null) {
      return
    }

    const strategy = getDependencyDeleteStrategy(ctx.entityType)
    if (strategy === undefined) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: 'Delete preflight not available for this entity type',
        code: 'PREFLIGHT_FAILED',
        details: NOT_REGISTERED_DETAILS,
        id: ctx.entityId,
      })
      return
    }

    const preflight = await strategy.preflight({
      entityConfig: ctx.entityConfig,
      entityType: ctx.entityType,
      entityId: ctx.entityId,
    })

    const token = issueDeleteContractPreflightToken({
      entityType: ctx.entityType,
      entityId: ctx.entityId,
      canDirectDelete: preflight.canDirectDelete,
    })

    sendSuccess(res, { ...preflight, preflightToken: token })
  } catch (error) {
    logger.error('Delete contract preflight failed', { err: error })
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.FETCH_ENTITY.replace('{displayName}', 'entity'),
      'entity',
      'delete contract preflight'
    )
  }
}

export async function handleDeleteContractResolve(req: Request, res: Response): Promise<void> {
  try {
    const ctx = readEntityRouteContext(req, res)
    if (ctx === null) {
      return
    }

    const strategy = getDependencyDeleteStrategy(ctx.entityType)
    if (strategy === undefined) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: 'Delete resolve not available for this entity type',
        code: 'PREFLIGHT_FAILED',
        details: NOT_REGISTERED_DETAILS,
        id: ctx.entityId,
      })
      return
    }

    const body = req.body
    if (!isRecord(body)) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Request body must be a JSON object',
        id: ctx.entityId,
      })
      return
    }

    if (typeof body.preflightToken !== 'string' || body.preflightToken === '') {
      sendDeleteContractError(res, HTTP_STATUS_CODES.CONFLICT, {
        error: 'Preflight token missing or invalid',
        code: 'STALE_PREFLIGHT',
        details: 'preflightToken is required for delete resolve',
        id: ctx.entityId,
      })
      return
    }

    const parsed = parseDeleteResolveBody(body)
    if (parsed === null) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Invalid resolve body (entityType, entityId, preflightToken, resolutions)',
        id: ctx.entityId,
      })
      return
    }

    if (parsed.entityType !== ctx.entityType || parsed.entityId !== ctx.entityId) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Body entityType and entityId must match URL parameters',
        id: ctx.entityId,
      })
      return
    }

    const snapshot = getDeleteContractPreflightToken(
      parsed.preflightToken,
      ctx.entityType,
      ctx.entityId
    )
    if (snapshot === null) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.CONFLICT, {
        error: 'Preflight token is stale or invalid',
        code: 'STALE_PREFLIGHT',
        details: 'Run delete preflight again',
        id: ctx.entityId,
      })
      return
    }

    const result = await strategy.resolve({
      entityConfig: ctx.entityConfig,
      entityType: ctx.entityType,
      entityId: ctx.entityId,
      body: parsed,
      tokenSnapshot: snapshot,
    })

    sendSuccess(res, result)
  } catch (error) {
    logger.error('Delete contract resolve failed', { err: error })
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.UPDATE_ENTITY.replace('{displayName}', 'entity'),
      'entity',
      'delete contract resolve',
      paramString(req, 'id')
    )
  }
}

export async function handleDeleteContractFinalize(req: Request, res: Response): Promise<void> {
  try {
    const ctx = readEntityRouteContext(req, res)
    if (ctx === null) {
      return
    }

    const strategy = getDependencyDeleteStrategy(ctx.entityType)
    if (strategy === undefined) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: 'Delete finalize not available for this entity type',
        code: 'PREFLIGHT_FAILED',
        details: NOT_REGISTERED_DETAILS,
        id: ctx.entityId,
      })
      return
    }

    const body = req.body
    if (!isRecord(body)) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Request body must be a JSON object',
        id: ctx.entityId,
      })
      return
    }

    const parsed = parseDeleteFinalizeBody(body)
    if (parsed === null) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Invalid finalize body (entityType, entityId, preflightToken)',
        id: ctx.entityId,
      })
      return
    }

    if (parsed.entityType !== ctx.entityType || parsed.entityId !== ctx.entityId) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
        error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
        code: 'RESOLUTION_INVALID',
        details: 'Body entityType and entityId must match URL parameters',
        id: ctx.entityId,
      })
      return
    }

    const snapshot = consumeDeleteContractPreflightToken(
      parsed.preflightToken,
      ctx.entityType,
      ctx.entityId
    )
    if (snapshot === null) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.CONFLICT, {
        error: 'Preflight token is stale or invalid',
        code: 'STALE_PREFLIGHT',
        details: 'Run delete preflight again',
        id: ctx.entityId,
      })
      return
    }

    if (!snapshot.canDirectDelete) {
      sendDeleteContractError(res, HTTP_STATUS_CODES.CONFLICT, {
        error: 'Delete cannot be finalized while blocking dependencies exist',
        code: 'HARD_BLOCKED',
        details: 'Resolve blocking dependencies first, then run preflight again',
        id: ctx.entityId,
      })
      return
    }

    const fin = await strategy.finalize({
      entityConfig: ctx.entityConfig,
      entityType: ctx.entityType,
      entityId: ctx.entityId,
      body: parsed,
      tokenSnapshot: snapshot,
      sequelize,
    })

    if (!fin.ok) {
      sendDeleteContractError(res, fin.httpStatus, {
        error: fin.error,
        code: fin.code,
        details: fin.details,
        id: ctx.entityId,
      })
      return
    }

    sendSuccess(res, fin.body)
  } catch (error) {
    logger.error('Delete contract finalize failed', { err: error })
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.DELETE_ENTITY.replace('{displayName}', 'entity'),
      'entity',
      'delete contract finalize',
      paramString(req, 'id')
    )
  }
}
