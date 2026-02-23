/**
 * Property API endpoint builders
 */

export function getPropertyEndpoint(): string {
  return '/properties'
}

export function getPropertyByIdEndpoint(id: string): string {
  return `/properties/${id}`
}
