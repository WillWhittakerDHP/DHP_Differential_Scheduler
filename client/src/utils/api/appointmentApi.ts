/**
 * Appointment API endpoint builders
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
