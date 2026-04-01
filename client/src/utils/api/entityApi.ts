/**
 * WHY: Mirrors `ENTITY_DELETE_ROUTE_SEGMENTS` on the server (`entityConstants.ts`).
 * Spec: `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`
 */
const ENTITY_DELETE_SEGMENTS = {
  PREFLIGHT: 'delete-preflight',
  FINALIZE: 'delete-finalize',
} as const

export function getEntityEndpoint(entityKey: string): string {
  return `/entities/${entityKey}`
}

export function getEntityByIdEndpoint(entityKey: string, id: string): string {
  return `/entities/${entityKey}/${id}`
}

export function getOrderIndexEndpoint(entityKey: string): string {
  return `/entities/${entityKey}/order_index`
}

export function getBulkPatchEndpoint(entityKey: string): string {
  return `/entities/${entityKey}/bulk`
}

export function getEntitiesBatchEndpoint(): string {
  return '/entities/batch'
}

export function getDeletePreflightEndpoint(entityKey: string, id: string): string {
  return `/entities/${entityKey}/${id}/${ENTITY_DELETE_SEGMENTS.PREFLIGHT}`
}

export function getDeleteFinalizeEndpoint(entityKey: string, id: string): string {
  return `/entities/${entityKey}/${id}/${ENTITY_DELETE_SEGMENTS.FINALIZE}`
}
