
export function getAppointmentEndpoint(): string {
  return '/appointments'
}

export function getAppointmentByIdEndpoint(id: string): string {
  return `/appointments/${id}`
}

export function getAppointmentVersionsEndpoint(id: string): string {
  return `/appointments/${id}/versions`
}

/** Session 6.8.6.2: list for admin entry dropdown (Edit quote / Reschedule). */
export function getListForAdminEntryEndpoint(): string {
  return '/appointments/list-for-admin-entry'
}
