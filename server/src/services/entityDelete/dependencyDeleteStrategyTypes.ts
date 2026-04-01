import type { Request } from 'express'
import type { Sequelize } from 'sequelize'
import type {
  DeleteContractErrorCode,
  DeleteFinalizeRequest,
  DeleteFinalizeResponse,
  DeletePreflightResponse,
  DeleteResolveRequest,
  DeleteResolveResponse,
} from '@shared/types/adminDeleteDependency.js'
import type { PreflightTokenPayload } from './deleteContractPreflightTokenStore.js'

type EntityConfigContext = NonNullable<Request['entityConfig']>

export type DependencyDeletePreflightArgs = {
  entityConfig: EntityConfigContext
  entityType: string
  entityId: string
}

export type DependencyDeleteResolveArgs = {
  entityConfig: EntityConfigContext
  entityType: string
  entityId: string
  body: DeleteResolveRequest
  tokenSnapshot: PreflightTokenPayload
}

export type DependencyDeleteFinalizeArgs = {
  entityConfig: EntityConfigContext
  entityType: string
  entityId: string
  body: DeleteFinalizeRequest
  tokenSnapshot: PreflightTokenPayload
  sequelize: Sequelize
}

/** Strategy `finalize` returns this so the HTTP layer can map codes without throwing. */
export type DependencyDeleteFinalizeResult =
  | { ok: true; body: DeleteFinalizeResponse }
  | {
      ok: false
      httpStatus: number
      error: string
      code: DeleteContractErrorCode
      details?: string
    }

export interface DependencyDeleteStrategy {
  preflight(args: DependencyDeletePreflightArgs): Promise<DeletePreflightResponse>
  resolve(args: DependencyDeleteResolveArgs): Promise<DeleteResolveResponse>
  finalize(args: DependencyDeleteFinalizeArgs): Promise<DependencyDeleteFinalizeResult>
}
