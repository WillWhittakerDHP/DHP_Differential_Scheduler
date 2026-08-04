/**
 * Shared appointment shapes and normalization for invite preview + orchestration.
 */
import type { Appointment as AppointmentType } from '../../db/models/booking/appointment.js'
import type { InviteAppointmentData } from './inviteContextBuilder.js'
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('InviteAppointmentShared')

/** Attendee row as loaded on appointment includes (orchestration may include nested user). */
interface AppointmentAttendeeWithUser {
  id: string
  userId: string
  userTypeBlockInstanceId: string | null
  shouldReceiveInvitation: boolean
  invitationStatus: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

/** Appointment instance with eager-loaded relations used by invite flows. */
export interface AppointmentWithRelations extends AppointmentType {
  attendees?: AppointmentAttendeeWithUser[]
  propertyVersion?: InviteAppointmentData['propertyVersion']
}

/** Plain appointment snapshot for preview + calendar invite logic (arrays guaranteed). */
export interface NormalizedAppointmentForInviteFlow {
  id: string
  selectedDate: Date | null
  selectedTimeSlots: Array<Record<string, unknown>> | null
  status: AppointmentType['status']
  propertyVersion?: InviteAppointmentData['propertyVersion']
  selectedServiceIds: string[]
  selectedTimeIds: string[]
  selectedEventIds: string[]
  attendees: AppointmentAttendeeWithUser[]
}

/** `event_instances` link flags — strip template placeholders when segment disables reschedule/cancel links. */
export function linkStripSetForSegmentLinkFlags(
  segment: { includeRescheduleLink?: boolean; includeCancelLink?: boolean } | null | undefined
): Set<string> {
  const strip = new Set<string>()
  if (segment?.includeRescheduleLink === false) {
    strip.add('rescheduleLink')
  }
  if (segment?.includeCancelLink === false) {
    strip.add('cancelLink')
  }
  return strip
}

function asArray<T>(
  value: T[] | null | undefined,
  appointmentId: string,
  field: string,
  logWhenEmpty: boolean
): T[] {
  if (Array.isArray(value)) return value
  if (logWhenEmpty) {
    logger.debug('Invite flow: normalizing null/undefined to []', { appointmentId, field })
  }
  return []
}

export function normalizeAppointmentForInviteFlow(
  raw: AppointmentWithRelations,
  options: { logEmptyArrays: boolean }
): NormalizedAppointmentForInviteFlow {
  const j = raw.toJSON() as Record<string, unknown>
  const id = String(j.id)
  const log = options.logEmptyArrays
  return {
    id,
    selectedDate: (j.selectedDate as Date | null) ?? null,
    selectedTimeSlots: (j.selectedTimeSlots as Array<Record<string, unknown>> | null) ?? null,
    status: j.status as NormalizedAppointmentForInviteFlow['status'],
    propertyVersion: raw.propertyVersion,
    selectedServiceIds: asArray(j.selectedServiceIds as string[] | null | undefined, id, 'selectedServiceIds', log),
    selectedTimeIds: asArray(j.selectedTimeIds as string[] | null | undefined, id, 'selectedTimeIds', log),
    selectedEventIds: asArray(j.selectedEventIds as string[] | null | undefined, id, 'selectedEventIds', log),
    attendees: asArray(raw.attendees, id, 'attendees', log),
  }
}

export function toInviteAppointmentData(appointment: NormalizedAppointmentForInviteFlow): InviteAppointmentData {
  const rawSlots = appointment.selectedTimeSlots
  const selectedTimeSlots: Array<{ startTime: string; endTime: string }> | null = rawSlots
    ? rawSlots
        .map((s: Record<string, unknown>) => {
          const start = s.startTime
          const end = s.endTime
          if (typeof start === 'string' && typeof end === 'string') return { startTime: start, endTime: end }
          return null
        })
        .filter((slot): slot is { startTime: string; endTime: string } => slot !== null)
    : null
  return {
    id: appointment.id,
    selectedDate: appointment.selectedDate,
    selectedTimeSlots: selectedTimeSlots?.length ? selectedTimeSlots : null,
    status: appointment.status,
    propertyVersion: appointment.propertyVersion ?? undefined,
  }
}

export function collectBlockInstanceIds(appointment: NormalizedAppointmentForInviteFlow): string[] {
  return [
    ...appointment.selectedServiceIds,
    ...appointment.selectedTimeIds,
    ...appointment.selectedEventIds,
  ]
}
