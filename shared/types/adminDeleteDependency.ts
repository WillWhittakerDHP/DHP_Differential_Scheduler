/**
 * Admin dependency-aware delete contract (preflight / resolve / finalize).
 * Policy literals MUST match phase-6.17-guide.md (no aliases).
 */

/** Edge policy classification — character-for-character match to phase guide table. */
export type DeleteDependencyPolicy =
  | 'reassign_required'
  | 'safe_auto_remove'
  | 'confirm_bulk_remove'
  | 'hard_blocked'
  | 'allow_direct_delete'

export const DELETE_DEPENDENCY_POLICIES: readonly DeleteDependencyPolicy[] = [
  'reassign_required',
  'safe_auto_remove',
  'confirm_bulk_remove',
  'hard_blocked',
  'allow_direct_delete',
] as const

const DELETE_DEPENDENCY_POLICY_SET = new Set<string>(DELETE_DEPENDENCY_POLICIES)

export function isDeleteDependencyPolicy(value: unknown): value is DeleteDependencyPolicy {
  return typeof value === 'string' && DELETE_DEPENDENCY_POLICY_SET.has(value)
}

/** Node role in the dependency graph (UI / server may extend semantics). */
export type DeleteDependencyNodeKind = 'entity' | 'relationship' | 'summary'

export interface DeleteDependencyNode {
  id: string
  kind: DeleteDependencyNodeKind
  /** Short display label for admin UI */
  label?: string
  entityType?: string
  entityId?: string
  /** Aggregate count when this node represents many rows */
  count?: number
  metadata?: Record<string, unknown>
}

export interface DeleteDependencyEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  policy: DeleteDependencyPolicy
  message?: string
  metadata?: Record<string, unknown>
}

/**
 * Result of delete preflight: graph + whether a direct delete is allowed without wizard steps.
 */
export interface DeletePreflightResponse {
  entityType: string
  entityId: string
  nodes: DeleteDependencyNode[]
  edges: DeleteDependencyEdge[]
  canDirectDelete: boolean
  /** Opaque token for correlate resolve/finalize with this preflight (server-issued). */
  preflightToken?: string
  /** Human-readable blockers; use `DeleteContractErrorCode` on API errors for machine codes. */
  blockedReasons?: string[]
}

/** User/server resolution step for one dependency edge (extend in 6.17.2 as needed). */
export type DeleteResolutionAction =
  | { type: 'reassign'; edgeId: string; targetEntityId: string }
  | { type: 'confirm_bulk_remove'; edgeId: string }
  | { type: 'noop' }

export interface DeleteResolveRequest {
  entityType: string
  entityId: string
  preflightToken?: string
  resolutions: DeleteResolutionAction[]
}

export interface DeleteResolvePartialError {
  code: DeleteContractErrorCode
  message: string
  edgeId?: string
}

export interface DeleteResolveResponse {
  applied: boolean
  partialErrors?: DeleteResolvePartialError[]
  /** When another preflight round is required after partial apply. */
  nextPreflightToken?: string
}

export interface DeleteFinalizeRequest {
  entityType: string
  entityId: string
  preflightToken?: string
  resolveToken?: string
}

export interface DeleteFinalizeResponse {
  deleted: boolean
  entityId: string
}

/**
 * Structured API error codes for delete contract endpoints.
 * Extend in later tasks; map to HTTP status + `entityErrorHandler` in 6.17.2.
 */
export type DeleteContractErrorCode =
  | 'PREFLIGHT_FAILED'
  | 'ENTITY_NOT_FOUND'
  | 'STALE_PREFLIGHT'
  | 'RESOLUTION_INVALID'
  | 'HARD_BLOCKED'
  | 'FINALIZE_CONFLICT'
  | 'INTERNAL'
