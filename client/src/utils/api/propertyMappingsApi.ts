/**
 * Property Mappings API endpoint builders
 * WHY: Single place for property field and feature mapping CRUD endpoints
 */

export function getPropertyFieldMappingsEndpoint(): string {
  return '/property-mappings/field-mappings'
}

export function getPropertyFeatureMappingsEndpoint(): string {
  return '/property-mappings/feature-mappings'
}
