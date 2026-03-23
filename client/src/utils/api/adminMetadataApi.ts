
export function getAdminMetadataEndpoint(entityType: string, entityId: string): string {
  return `/admin-metadata/${entityType}/${entityId}`
}

export function getAdminMetadataBatchEndpoint(): string {
  return '/admin-metadata/batch'
}
