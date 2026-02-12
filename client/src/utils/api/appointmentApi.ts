/**
 * Appointment API endpoint builders
 * WHY: Single place for appointment CRUD endpoints; reduces api.ts export count
 */

export function getAppointmentEndpoint(): string {
  return '/appointments'
}

export function getAppointmentByIdEndpoint(id: string): string {
  return `/appointments/${id}`
}

export function getAppointmentVersionsEndpoint(id: string): string {
  return `/appointments/${id}/versions`
}
