/**
 * Property API endpoint builders
 * WHY: Single place for property CRUD endpoints; reduces api.ts export count
 */

export function getPropertyEndpoint(): string {
  return '/properties'
}

export function getPropertyByIdEndpoint(id: string): string {
  return `/properties/${id}`
}
