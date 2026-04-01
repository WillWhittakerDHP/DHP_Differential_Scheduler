import type { Response } from 'express'
import type { DeleteContractErrorCode } from '@shared/types/adminDeleteDependency.js'

/**
 * JSON shape for dependency-delete contract errors (v1).
 * Aligns with `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`.
 */
export function sendDeleteContractError(
  res: Response,
  statusCode: number,
  params: {
    error: string
    code: DeleteContractErrorCode
    details?: string
    id?: string
  }
): void {
  const body: {
    error: string
    code: DeleteContractErrorCode
    details?: string
    id?: string
  } = {
    error: params.error,
    code: params.code,
  }
  if (params.details !== undefined) {
    body.details = params.details
  }
  if (params.id !== undefined) {
    body.id = params.id
  }
  res.status(statusCode).json(body)
}
