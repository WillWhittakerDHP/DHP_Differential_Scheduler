/**
 * Entity API endpoint builders
 */

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
