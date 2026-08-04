/**
 * Pure helpers for appointment attendees (buyer/agent role detection and ID mapping).
 * WHY: Single source for attendee role logic used by table handlers and appointment field formatters.
 */
import {
  ATTENDEE_ROLE_BUYER,
  ATTENDEE_ROLE_AGENT,
  USER_ROLE_BUYER,
  USER_ROLE_AGENT,
} from '@/constants/attendeeRoles'
import type { AppointmentResponse, AttendeeResponse } from '@/types/appointment'
import type { AttendeeRequest } from '@shared/types/appointmentTypes'

function blockNameIsBuyer(name: string | null | undefined): boolean {
  if (typeof name !== 'string' || !name.trim()) return false
  const n = name.trim().toLowerCase()
  return n === ATTENDEE_ROLE_BUYER.toLowerCase()
}

/** Matches `users.user_role` for buyer rows (`buyer`). */
export function isBuyerUserRole(role: string | undefined): boolean {
  if (role === undefined || role === '') return false
  return role === USER_ROLE_BUYER
}

function isBuyerAttendee(a: AttendeeResponse): boolean {
  const role = a.user?.userRole as string | undefined
  return blockNameIsBuyer(a.userTypeBlockInstance?.name) || isBuyerUserRole(role)
}

function isAgentAttendee(a: AttendeeResponse): boolean {
  return a.userTypeBlockInstance?.name === ATTENDEE_ROLE_AGENT || a.user?.userRole === USER_ROLE_AGENT
}

/**
 * Build attendees array from buyer and agent IDs (no mutation).
 * Used when saving create/edit so API receives attendees instead of legacy single-user fields.
 */
export function attendeesFromBuyerAndAgent(
  buyerId: string | null | undefined,
  agentId: string | null | undefined
): AttendeeRequest[] {
  const entries: AttendeeRequest[] = []
  if (buyerId) {
    entries.push({ userId: buyerId, role: USER_ROLE_BUYER, shouldReceiveInvitation: true })
  }
  if (agentId) {
    entries.push({ userId: agentId, role: USER_ROLE_AGENT, shouldReceiveInvitation: true })
  }
  return entries
}

export function getBuyerIdFromAttendees(appointment: AppointmentResponse): string | undefined {
  const buyer = appointment.attendees?.find(isBuyerAttendee)
  return buyer?.userId
}

export function getAgentIdFromAttendees(appointment: AppointmentResponse): string | undefined {
  const agent = appointment.attendees?.find(isAgentAttendee)
  return agent?.userId
}

export function getBuyerAttendee(appointment: AppointmentResponse): AttendeeResponse | undefined {
  return appointment.attendees?.find(isBuyerAttendee)
}

export function getAgentAttendee(appointment: AppointmentResponse): AttendeeResponse | undefined {
  return appointment.attendees?.find(isAgentAttendee)
}
