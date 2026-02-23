/**
 * User API endpoint builders
 */

export function getUserEndpoint(): string {
  return '/users'
}

export function getUserByIdEndpoint(id: string): string {
  return `/users/${id}`
}
