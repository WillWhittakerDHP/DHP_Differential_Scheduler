/**
 * Attendee helpers for invite orchestration: building attendee lists and updating status.
 */

import type { EventAttendee } from '../google/calendar/calendarTypes.js'
import { AppointmentAttendee, EventShapeAttendee } from '../../config/app.js'
import { createLogger } from '../../utils/logger.js'
import { INVITATION_STATUS_FAILED, INVITATION_STATUS_SENT } from './inviteConstants.js'

const logger = createLogger('InviteAttendeeHelpers')

/** Minimal appointment shape needed for attendee operations (avoids circular dep on orchestration types). */
interface AppointmentForAttendeeOps {
  attendees: Array<{
    id: string
    shouldReceiveInvitation: boolean
    userTypeBlockInstanceId: string | null
    user?: {
      id: string
      email: string
      firstName?: string
      lastName?: string
    }
  }>
}

function buildAllAttendees(appointment: AppointmentForAttendeeOps): EventAttendee[] {
  return appointment.attendees
    .filter((att) => att.shouldReceiveInvitation && att.user?.email)
    .map((att) => ({
      email: att.user!.email,
      displayName: [att.user!.firstName, att.user!.lastName].filter(Boolean).join(' ') || undefined,
    }))
}

export async function buildAttendeesForEventShape(
  eventShapeId: string,
  appointment: AppointmentForAttendeeOps
): Promise<EventAttendee[]> {
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId, disabled: false },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(shapeAttendees.map((sa) => sa.userTypeBlockInstanceId))

  if (allowedUserTypes.size === 0) {
    logger.debug(
      `No EventShapeAttendees configured for shape ${eventShapeId} — inviting all appointment attendees`
    )
    return buildAllAttendees(appointment)
  }

  return appointment.attendees
    .filter(
      (att) =>
        att.shouldReceiveInvitation &&
        att.userTypeBlockInstanceId &&
        allowedUserTypes.has(att.userTypeBlockInstanceId) &&
        att.user?.email
    )
    .map((att) => ({
      email: att.user!.email,
      displayName: [att.user!.firstName, att.user!.lastName].filter(Boolean).join(' ') || undefined,
    }))
}

export async function updateAttendeeRecords(
  appointment: AppointmentForAttendeeOps,
  eventShapeId: string,
  googleEventId: string
): Promise<number> {
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId, disabled: false },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(shapeAttendees.map((sa) => sa.userTypeBlockInstanceId))

  const matchingAttendees =
    allowedUserTypes.size > 0
      ? appointment.attendees.filter(
          (att) =>
            att.shouldReceiveInvitation &&
            att.userTypeBlockInstanceId &&
            allowedUserTypes.has(att.userTypeBlockInstanceId)
        )
      : appointment.attendees.filter((att) => att.shouldReceiveInvitation)

  let updated = 0

  for (const attendee of matchingAttendees) {
    try {
      await AppointmentAttendee.update(
        { googleEventId, invitationStatus: INVITATION_STATUS_SENT },
        { where: { id: attendee.id } }
      )
      updated++
    } catch (error) {
      logger.error(`Failed to update attendee ${attendee.id}:`, error)
    }
  }

  return updated
}

export async function markAttendeesAsFailed(
  appointment: AppointmentForAttendeeOps,
  eventShapeId: string,
  errorMessage: string
): Promise<number> {
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId, disabled: false },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(shapeAttendees.map((sa) => sa.userTypeBlockInstanceId))

  const matchingAttendees =
    allowedUserTypes.size > 0
      ? appointment.attendees.filter(
          (att) =>
            att.shouldReceiveInvitation &&
            att.userTypeBlockInstanceId &&
            allowedUserTypes.has(att.userTypeBlockInstanceId)
        )
      : appointment.attendees.filter((att) => att.shouldReceiveInvitation)

  let updated = 0

  for (const attendee of matchingAttendees) {
    try {
      await AppointmentAttendee.update(
        { invitationStatus: INVITATION_STATUS_FAILED },
        { where: { id: attendee.id } }
      )
      updated++
    } catch (updateError) {
      logger.error(`Failed to mark attendee ${attendee.id} as failed:`, updateError)
    }
  }

  if (updated > 0) {
    logger.warn(`Marked ${updated} attendee(s) as '${INVITATION_STATUS_FAILED}' due to: ${errorMessage}`)
  }

  return updated
}
