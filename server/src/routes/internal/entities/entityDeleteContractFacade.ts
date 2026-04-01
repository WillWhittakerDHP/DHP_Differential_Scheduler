/**
 * Dependency-aware delete contract handlers (preflight / resolve / finalize).
 * Stub until task 6.17.2.2 — registry-backed graphs, tokens, and transactions.
 */

import type { Request, Response } from 'express'
import { sendSuccess, sendBadRequest } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { ERROR_MESSAGES } from './entityConstants.js'
import { validateEntityId } from './entityValidators.js'
import { sendDeleteContractError } from './entityDeleteContractResponse.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

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

export function handleDeleteContractPreflight(req: Request, res: Response): void {
  const ctx = readEntityRouteContext(req, res)
  if (ctx === null) {
    return
  }

  sendSuccess(res, {
    entityType: ctx.entityType,
    entityId: ctx.entityId,
    nodes: [],
    edges: [],
    canDirectDelete: false,
  })
}

const STUB_RESOLVE_FINALIZE_DETAILS =
  'Dependency-aware resolve/finalize is not implemented until registry work (task 6.17.2.2).'

export function handleDeleteContractResolve(req: Request, res: Response): void {
  const ctx = readEntityRouteContext(req, res)
  if (ctx === null) {
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

  const bodyEntityType = body.entityType
  const bodyEntityId = body.entityId
  if (typeof bodyEntityType !== 'string' || typeof bodyEntityId !== 'string') {
    sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
      error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
      code: 'RESOLUTION_INVALID',
      details: 'entityType and entityId are required strings in the request body',
      id: ctx.entityId,
    })
    return
  }

  if (bodyEntityType !== ctx.entityType || bodyEntityId !== ctx.entityId) {
    sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
      error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
      code: 'RESOLUTION_INVALID',
      details: 'Body entityType and entityId must match URL parameters',
      id: ctx.entityId,
    })
    return
  }

  if (!Array.isArray(body.resolutions)) {
    sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
      error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
      code: 'RESOLUTION_INVALID',
      details: 'resolutions must be an array',
      id: ctx.entityId,
    })
    return
  }

  sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
    error: 'Delete resolve not available yet',
    code: 'PREFLIGHT_FAILED',
    details: STUB_RESOLVE_FINALIZE_DETAILS,
    id: ctx.entityId,
  })
}

export function handleDeleteContractFinalize(req: Request, res: Response): void {
  const ctx = readEntityRouteContext(req, res)
  if (ctx === null) {
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

  const bodyEntityType = body.entityType
  const bodyEntityId = body.entityId
  if (typeof bodyEntityType !== 'string' || typeof bodyEntityId !== 'string') {
    sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
      error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
      code: 'RESOLUTION_INVALID',
      details: 'entityType and entityId are required strings in the request body',
      id: ctx.entityId,
    })
    return
  }

  if (bodyEntityType !== ctx.entityType || bodyEntityId !== ctx.entityId) {
    sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
      error: ERROR_MESSAGES.VALIDATION_FAILED.replace('{displayName}', ctx.entityConfig.displayName),
      code: 'RESOLUTION_INVALID',
      details: 'Body entityType and entityId must match URL parameters',
      id: ctx.entityId,
    })
    return
  }

  sendDeleteContractError(res, HTTP_STATUS_CODES.BAD_REQUEST, {
    error: 'Delete finalize not available yet',
    code: 'PREFLIGHT_FAILED',
    details: STUB_RESOLVE_FINALIZE_DETAILS,
    id: ctx.entityId,
  })
}
