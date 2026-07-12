/**
 * Shared appointment-related types for client and server.
 */
import {
  USER_ROLE_AGENT,
  USER_ROLE_BUYER,
  USER_ROLE_INSPECTOR,
  USER_ROLE_OWNER,
} from '../constants/roleConstants'
import type { SlotTimeBounds } from './availabilityTypes'

/** Canonical one-slot payload for API and `appointment_time_slots` rows (ISO start/end, optional duration minutes). */
export interface AppointmentSelectedTimeSlotPayload extends Omit<SlotTimeBounds, 'duration'> {
  duration?: number
}

/** Attendee request for calendar invitations; single source for client and server. */
export interface AttendeeRequest {
  userId: string
  userTypeBlockInstanceId?: string | null
  shouldReceiveInvitation?: boolean
  role?:
    | typeof USER_ROLE_BUYER
    | typeof USER_ROLE_AGENT
    | typeof USER_ROLE_OWNER
    | typeof USER_ROLE_INSPECTOR
}

/**
 * One row for the admin entry dropdown (Edit quote / Reschedule).
 * Session 6.8.6 — list-appointments API returns an array of these.
 * Client/agent names are resolved from users (same as admin appointments table).
 */
export interface AdminEntryAppointmentItem {
  id: string
  address: string
  /** User ID of the buyer (primary) attendee; resolve display name via users lookup. */
  buyerUserId: string | null
  /** User ID of the agent/inspector attendee; resolve display name via users lookup. */
  agentUserId: string | null
}
