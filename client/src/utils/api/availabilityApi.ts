/**
 * Availability API endpoint builders
 * WHY: Single place for availability endpoints; reduces api.ts export count
 */

export function getAvailabilityEndpoint(): string {
  return '/availability'
}
