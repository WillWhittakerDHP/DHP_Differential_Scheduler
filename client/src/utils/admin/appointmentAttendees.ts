/**
 * Pure helpers for appointment attendees (client/agent role detection and ID mapping).
 * WHY: Single source for attendee role logic used by table handlers and appointment field formatters.
 */
import { ATTENDEE_ROLE_CLIENT, ATTENDEE_ROLE_AGENT, USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import type { AppointmentResponse, AttendeeResponse } from '@/types/appointment'
import type { AttendeeRequest } from '@shared/types/appointmentTypes'

function isClientAttendee(a: AttendeeResponse): boolean {
  return a.userTypeBlockInstance?.name === ATTENDEE_ROLE_CLIENT || a.user?.userRole === USER_ROLE_CLIENT
}

function isAgentAttendee(a: AttendeeResponse): boolean {
  return a.userTypeBlockInstance?.name === ATTENDEE_ROLE_AGENT || a.user?.userRole === USER_ROLE_AGENT
}

/**
 * Build attendees array from client and agent IDs (no mutation).
 * Used when saving create/edit so API receives attendees instead of legacy clientId/agentId.
 */
export function attendeesFromClientAndAgent(
  clientId: string | null | undefined,
  agentId: string | null | undefined
): AttendeeRequest[] {
  const entries: AttendeeRequest[] = []
  if (clientId) {
    entries.push({ userId: clientId, role: USER_ROLE_CLIENT, shouldReceiveInvitation: true })
  }
  if (agentId) {
    entries.push({ userId: agentId, role: USER_ROLE_AGENT, shouldReceiveInvitation: true })
  }
  return entries
}

export function getClientIdFromAttendees(appointment: AppointmentResponse): string | undefined {
  const client = appointment.attendees?.find(isClientAttendee)
  return client?.userId
}

export function getAgentIdFromAttendees(appointment: AppointmentResponse): string | undefined {
  const agent = appointment.attendees?.find(isAgentAttendee)
  return agent?.userId
}

export function getClientAttendee(appointment: AppointmentResponse): AttendeeResponse | undefined {
  return appointment.attendees?.find(isClientAttendee)
}

export function getAgentAttendee(appointment: AppointmentResponse): AttendeeResponse | undefined {
  return appointment.attendees?.find(isAgentAttendee)
}
