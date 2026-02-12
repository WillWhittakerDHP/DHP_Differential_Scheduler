/**
 * Admin metadata API endpoint builders
 * WHY: Single place for admin metadata and batch endpoints; reduces api.ts export count
 */

export function getAdminMetadataEndpoint(entityType: string, entityId: string): string {
  return `/admin-metadata/${entityType}/${entityId}`
}

export function getAdminMetadataBatchEndpoint(): string {
  return '/admin-metadata/batch'
}

export function getAdminPrimitiveMetadataEndpoint(entityType: string, entityId: string): string {
  return getAdminMetadataEndpoint(entityType, entityId)
}

export function getAdminRelationshipMetadataEndpoint(entityType: string, entityId: string): string {
  return getAdminMetadataEndpoint(entityType, entityId)
}
