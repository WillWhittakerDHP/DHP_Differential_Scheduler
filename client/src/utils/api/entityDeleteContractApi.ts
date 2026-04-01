/**
 * Typed HTTP helpers for admin dependency-aware delete (preflight / resolve / finalize).
 * WHY: Single source for paths + DTOs; composables and wiring (6.17.3.2 / 6.17.4) import from here.
 */

import { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import type {
  DeleteContractErrorCode,
  DeleteFinalizeRequest,
  DeleteFinalizeResponse,
  DeletePreflightResponse,
  DeleteResolveRequest,
  DeleteResolveResponse,
} from '@shared/types/adminDeleteDependency'
import { createLogger } from '@/utils/logger'
import apiClient from './apiClientCore'
import {
  getDeleteFinalizeEndpoint,
  getDeletePreflightEndpoint,
  getDeleteResolveEndpoint,
} from './entityApi'

const logger = createLogger('entityDeleteContractApi')

/** Known codes from `@shared/types/adminDeleteDependency` — validate server `code` field at runtime. */
const DELETE_CONTRACT_ERROR_CODES = new Set<string>([
  'PREFLIGHT_FAILED',
  'ENTITY_NOT_FOUND',
  'STALE_PREFLIGHT',
  'RESOLUTION_INVALID',
  'HARD_BLOCKED',
  'FINALIZE_CONFLICT',
  'INTERNAL',
])

function parseDeleteContractErrorCode(value: unknown): DeleteContractErrorCode | undefined {
  if (typeof value !== 'string' || !DELETE_CONTRACT_ERROR_CODES.has(value)) {
    return undefined
  }
  return value as DeleteContractErrorCode
}

function messageFromDeleteContractBody(data: unknown, fallback: string): string {
  if (data == null || typeof data !== 'object') {
    return fallback
  }
  const d = data as { details?: unknown; error?: unknown; message?: unknown }
  const details = typeof d.details === 'string' ? d.details : undefined
  const err = typeof d.error === 'string' ? d.error : undefined
  const msg = typeof d.message === 'string' ? d.message : undefined
  return details ?? err ?? msg ?? fallback
}

/**
 * Structured failure for delete-contract calls. Thrown from API helpers when the request fails.
 */
export class DeleteContractApiError extends Error {
  override readonly name = 'DeleteContractApiError'

  constructor(
    message: string,
    public readonly code?: DeleteContractErrorCode,
    public readonly httpStatus?: number,
    public readonly details?: string,
    public readonly id?: string
  ) {
    super(message)
  }
}

/**
 * Maps axios / unknown errors to {@link DeleteContractApiError} for composable branching on `code`.
 */
export function extractDeleteContractError(error: unknown): DeleteContractApiError {
  const fallback = 'Delete contract request failed'

  if (isAxiosError(error) && error.response?.data != null) {
    const status = error.response.status
    const data = error.response.data
    const code = parseDeleteContractErrorCode(
      typeof data === 'object' && data !== null && 'code' in data ? (data as { code?: unknown }).code : undefined
    )
    const details =
      typeof data === 'object' && data !== null && 'details' in data && typeof (data as { details?: unknown }).details === 'string'
        ? (data as { details: string }).details
        : undefined
    const id =
      typeof data === 'object' && data !== null && 'id' in data && typeof (data as { id?: unknown }).id === 'string'
        ? (data as { id: string }).id
        : undefined
    const message = messageFromDeleteContractBody(data, error.message || fallback)
    return new DeleteContractApiError(message, code, status, details, id)
  }

  if (isAxiosError(error)) {
    return new DeleteContractApiError(error.message || fallback, undefined, error.response?.status)
  }

  if (error instanceof Error) {
    return new DeleteContractApiError(error.message || fallback)
  }

  return new DeleteContractApiError(fallback)
}

async function runDeleteContractCall<T>(fn: () => Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const { data } = await fn()
    return data
  } catch (err) {
    const mapped = extractDeleteContractError(err)
    logger.debug('delete contract request failed', {
      message: mapped.message,
      code: mapped.code,
      httpStatus: mapped.httpStatus,
    })
    throw mapped
  }
}

export async function fetchDeletePreflight(entityKey: string, entityId: string): Promise<DeletePreflightResponse> {
  const url = getDeletePreflightEndpoint(entityKey, entityId)
  return runDeleteContractCall(() => apiClient.get<DeletePreflightResponse>(url))
}

export async function postDeleteResolve(
  entityKey: string,
  entityId: string,
  body: DeleteResolveRequest
): Promise<DeleteResolveResponse> {
  const url = getDeleteResolveEndpoint(entityKey, entityId)
  return runDeleteContractCall(() => apiClient.post<DeleteResolveResponse>(url, body))
}

export async function postDeleteFinalize(
  entityKey: string,
  entityId: string,
  body: DeleteFinalizeRequest
): Promise<DeleteFinalizeResponse> {
  const url = getDeleteFinalizeEndpoint(entityKey, entityId)
  return runDeleteContractCall(() => apiClient.post<DeleteFinalizeResponse>(url, body))
}
