/**
 * User API endpoint builders
 * WHY: Single place for user CRUD endpoints; reduces api.ts export count
 */

export function getUserEndpoint(): string {
  return '/users'
}

export function getUserByIdEndpoint(id: string): string {
  return `/users/${id}`
}
