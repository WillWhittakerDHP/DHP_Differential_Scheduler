/**
 * Invite Orchestration Service
 *
 * The central pipeline for creating Google Calendar invites from appointments.
 *
 * Flow:
 *   1. Fetch appointment with relations (property, attendees, users)
 *   2. Resolve which EventInstances apply (appointment block instances → part assignments → event assignments → event instances)
 *   3. For each active EventInstance:
 *      a. Resolve title/description/location templates with appointment context
 *      b. Determine per-event attendees via EventShapeAttendee (which user types attend this shape)
 *      c. Call createEvent() with resolved templates + EventInstance calendar properties
 *      d. Update AppointmentAttendee records with googleEventId and invitationStatus
 *   4. Return aggregate results
 *
 * PATTERN: Orchestration service — coordinates multiple models and services.
 * Replaces the hardcoded appointmentCalendarService for richer, configurable invite behavior.
 */

import { Op } from 'sequelize'
import { createEvent } from '../google/calendar/eventCreationService.js'
import type { CreateEventParams, EventAttendee } from '../google/calendar/calendarTypes.js'
import {
  Appointment,
  AppointmentAttendee,
  User,
  PropertyVersion,
  Address,
  BlockInstance,
  PartAssignment,
  EventAssignment,
  EventInstance,
  EventShapeAttendee,
} from '../../config/app.js'
import type { Appointment as AppointmentType } from '../../db/models/booking/appointment.js'
import type { EventInstance as EventInstanceType } from '../../db/models/booking/event_instance.js'
import { resolveEventTemplates } from './templateResolver.js'
import { buildInviteContext, type InviteAppointmentData } from './inviteContextBuilder.js'
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('InviteOrchestrationService')

// ─── Result types ───────────────────────────────────────────────────────────

interface SingleEventResult {
  eventInstanceId: string
  eventInstanceName: string
  success: boolean
  googleEventId?: string
  eventLink?: string
  attendeesUpdated: number
  error?: string
}

export interface InviteOrchestrationResult {
  appointmentId: string
  totalEventsAttempted: number
  totalEventsCreated: number
  totalAttendeesUpdated: number
  events: SingleEventResult[]
  fallbackUsed: boolean
}

// ─── Main orchestration function ────────────────────────────────────────────

/**
 * Create calendar invites for an appointment using configured EventInstances.
 *
 * If no EventInstances are found for the appointment's selected services,
 * falls back to the legacy single-event behavior.
 */
export async function createInvitesForAppointment(
  appointmentId: string,
  calendarId: string = 'primary'
): Promise<InviteOrchestrationResult> {
  logger.info(`Creating invites for appointment ${appointmentId}`)

  const appointment = await fetchAppointmentWithRelations(appointmentId)
  if (!appointment) {
    logger.error(`Appointment ${appointmentId} not found`)
    return emptyResult(appointmentId)
  }

  const selectedBlockInstanceIds = collectBlockInstanceIds(appointment)
  const eventInstances = await findEventInstancesForBlockInstances(selectedBlockInstanceIds)

  if (eventInstances.length === 0) {
    logger.info('No EventInstances found for appointment — using fallback')
    return await createFallbackEvent(appointment, calendarId)
  }

  logger.info(`Found ${eventInstances.length} EventInstance(s) for appointment`)

  const serviceName = await resolveServiceName(selectedBlockInstanceIds)
  const context = buildInviteContext(appointment as InviteAppointmentData, serviceName)

  const events: SingleEventResult[] = []
  let totalAttendeesUpdated = 0

  for (const eventInstance of eventInstances) {
    const result = await createEventForInstance(
      eventInstance,
      appointment,
      context,
      calendarId
    )
    events.push(result)
    totalAttendeesUpdated += result.attendeesUpdated
  }

  const totalCreated = events.filter(e => e.success).length

  logger.info(
    `Invite orchestration complete: ${totalCreated}/${eventInstances.length} events created, ${totalAttendeesUpdated} attendees updated`
  )

  return {
    appointmentId,
    totalEventsAttempted: eventInstances.length,
    totalEventsCreated: totalCreated,
    totalAttendeesUpdated,
    events,
    fallbackUsed: false,
  }
}

// ─── Data fetching ──────────────────────────────────────────────────────────

async function fetchAppointmentWithRelations(appointmentId: string): Promise<AppointmentType | null> {
  return Appointment.findByPk(appointmentId, {
    include: [
      {
        model: PropertyVersion,
        as: 'propertyVersion',
        include: [{ model: Address, as: 'address' }],
      },
      {
        model: AppointmentAttendee,
        as: 'attendees',
        include: [
          { model: User, as: 'user' },
          { model: BlockInstance, as: 'userTypeBlockInstance' },
        ],
      },
    ],
  })
}

/**
 * Collect all block instance IDs referenced by the appointment
 * (services, properties, options).
 */
function collectBlockInstanceIds(appointment: AppointmentType): string[] {
  return [
    ...(appointment.selectedServiceIds ?? []),
    ...(appointment.selectedPropertyIds ?? []),
    ...(appointment.selectedOptionIds ?? []),
  ]
}

/**
 * Find all active EventInstances linked to the given block instance IDs
 * through the chain: block instance → part assignments → event assignments → event instances.
 *
 * Also handles event assignments where parent_kind = 'blockInstance' (direct block → event links).
 */
async function findEventInstancesForBlockInstances(
  blockInstanceIds: string[]
): Promise<EventInstanceType[]> {
  if (blockInstanceIds.length === 0) return []

  // Step 1: Find part instance IDs assigned to these block instances
  const partAssignments = await PartAssignment.findAll({
    where: { parentId: { [Op.in]: blockInstanceIds } },
    attributes: ['childId'],
  })
  const partInstanceIds = partAssignments.map(pa => pa.childId)

  // Step 2: Find event assignments for both part instances and direct block instances
  const parentIds = [...partInstanceIds, ...blockInstanceIds]
  if (parentIds.length === 0) return []

  const eventAssignments = await EventAssignment.findAll({
    where: { parentId: { [Op.in]: parentIds } },
    include: [{
      model: EventInstance,
      as: 'eventInstance',
      where: { active: true },
    }],
  })

  // Deduplicate by EventInstance ID (same instance may be linked multiple times)
  const seen = new Set<string>()
  const uniqueInstances: EventInstanceType[] = []

  for (const ea of eventAssignments) {
    if (ea.eventInstance && !seen.has(ea.eventInstance.id)) {
      seen.add(ea.eventInstance.id)
      uniqueInstances.push(ea.eventInstance)
    }
  }

  return uniqueInstances
}

/**
 * Resolve a human-readable service name from the selected block instance IDs.
 * Uses the first found block instance name as the primary service.
 */
async function resolveServiceName(blockInstanceIds: string[]): Promise<string | undefined> {
  if (blockInstanceIds.length === 0) return undefined

  const firstBlock = await BlockInstance.findByPk(blockInstanceIds[0], {
    attributes: ['name'],
  })
  return firstBlock?.name ?? undefined
}

// ─── Per-EventInstance event creation ───────────────────────────────────────

/**
 * Create a single Google Calendar event for one EventInstance.
 */
async function createEventForInstance(
  eventInstance: EventInstanceType,
  appointment: AppointmentType,
  context: Record<string, string>,
  calendarId: string
): Promise<SingleEventResult> {
  const instanceName = eventInstance.name

  try {
    // Resolve templates
    const resolved = resolveEventTemplates(
      {
        titleTemplate: eventInstance.titleTemplate,
        descriptionTemplate: eventInstance.descriptionTemplate,
        locationTemplate: eventInstance.locationTemplate,
      },
      context
    )

    // Use resolved templates, falling back to defaults when templates are empty
    const summary = resolved.summary || buildDefaultSummary(appointment)
    const description = resolved.description || buildDefaultDescription(appointment)
    const location = resolved.location || buildDefaultLocation(appointment)

    // Determine attendees for this event shape
    const attendees = await buildAttendeesForEventShape(
      eventInstance.eventShapeRef,
      appointment
    )

    // Build CreateEventParams with all EventInstance calendar properties
    const eventParams: CreateEventParams = {
      calendarId,
      summary,
      description: description || undefined,
      location: location || undefined,
      start: extractStartTime(appointment),
      end: extractEndTime(appointment),
      attendees,
      sendUpdates: eventInstance.sendUpdates,
      visibility: eventInstance.visibility,
      transparency: eventInstance.transparency,
      guestsCanModify: eventInstance.guestsCanModify,
      guestsCanInviteOthers: eventInstance.guestsCanInviteOthers,
      guestsCanSeeOtherGuests: eventInstance.guestsCanSeeOtherGuests,
      addConferenceLink: eventInstance.addConferenceLink,
      colorId: eventInstance.colorId,
      status: eventInstance.status,
      reminderOverrides: eventInstance.reminderOverrides,
    }

    const createdEvent = await createEvent(eventParams)

    // Update AppointmentAttendee records for the attendees that were invited
    const attendeesUpdated = await updateAttendeeRecords(
      appointment,
      eventInstance.eventShapeRef,
      createdEvent.id
    )

    logger.info(`Created event for "${instanceName}": ${createdEvent.id}, ${attendeesUpdated} attendees updated`)

    return {
      eventInstanceId: eventInstance.id,
      eventInstanceName: instanceName,
      success: true,
      googleEventId: createdEvent.id,
      eventLink: createdEvent.htmlLink,
      attendeesUpdated,
    }
  } catch (error) {
    logger.error(`Failed to create event for "${instanceName}":`, error)

    // Mark matching attendees as 'failed' so the failure is visible in the data
    const failedCount = await markAttendeesAsFailed(
      appointment,
      eventInstance.eventShapeRef,
      error instanceof Error ? error.message : 'Unknown error'
    )

    return {
      eventInstanceId: eventInstance.id,
      eventInstanceName: instanceName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      attendeesUpdated: failedCount,
    }
  }
}

// ─── Attendee resolution ────────────────────────────────────────────────────

/**
 * Determine which AppointmentAttendees should be invited to an event of a given shape.
 *
 * Flow:
 *   1. Look up EventShapeAttendees for the event shape → get list of userTypeBlockInstanceIds
 *   2. Filter AppointmentAttendees whose userTypeBlockInstanceId matches AND shouldReceiveInvitation = true
 *   3. Map to EventAttendee objects with email/displayName
 */
async function buildAttendeesForEventShape(
  eventShapeId: string,
  appointment: AppointmentType
): Promise<EventAttendee[]> {
  // Which user types should attend this event shape?
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(
    shapeAttendees.map(sa => sa.userTypeBlockInstanceId)
  )

  if (allowedUserTypes.size === 0) {
    logger.debug(`No EventShapeAttendees configured for shape ${eventShapeId} — inviting all appointment attendees`)
    return buildAllAttendees(appointment)
  }

  const appointmentAttendees = (appointment as unknown as { attendees?: AppointmentAttendeeWithUser[] }).attendees ?? []

  return appointmentAttendees
    .filter(att =>
      att.shouldReceiveInvitation &&
      att.userTypeBlockInstanceId &&
      allowedUserTypes.has(att.userTypeBlockInstanceId) &&
      att.user?.email
    )
    .map(att => ({
      email: att.user!.email,
      displayName: [att.user!.firstName, att.user!.lastName].filter(Boolean).join(' ') || undefined,
    }))
}

/**
 * Fallback: invite all attendees who should receive invitations.
 */
function buildAllAttendees(appointment: AppointmentType): EventAttendee[] {
  const attendees = (appointment as unknown as { attendees?: AppointmentAttendeeWithUser[] }).attendees ?? []

  return attendees
    .filter(att => att.shouldReceiveInvitation && att.user?.email)
    .map(att => ({
      email: att.user!.email,
      displayName: [att.user!.firstName, att.user!.lastName].filter(Boolean).join(' ') || undefined,
    }))
}

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

// ─── AppointmentAttendee record updates ─────────────────────────────────────

/**
 * After creating a Google Calendar event, update the AppointmentAttendee records
 * that were invited to this particular event.
 */
async function updateAttendeeRecords(
  appointment: AppointmentType,
  eventShapeId: string,
  googleEventId: string
): Promise<number> {
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(
    shapeAttendees.map(sa => sa.userTypeBlockInstanceId)
  )

  const appointmentAttendees = (appointment as unknown as { attendees?: AppointmentAttendeeWithUser[] }).attendees ?? []

  // Find the attendees that match this event shape
  const matchingAttendees = allowedUserTypes.size > 0
    ? appointmentAttendees.filter(
        att =>
          att.shouldReceiveInvitation &&
          att.userTypeBlockInstanceId &&
          allowedUserTypes.has(att.userTypeBlockInstanceId)
      )
    : appointmentAttendees.filter(att => att.shouldReceiveInvitation)

  let updated = 0

  for (const attendee of matchingAttendees) {
    try {
      await AppointmentAttendee.update(
        { googleEventId, invitationStatus: 'sent' },
        { where: { id: attendee.id } }
      )
      updated++
    } catch (error) {
      logger.error(`Failed to update attendee ${attendee.id}:`, error)
    }
  }

  return updated
}

/**
 * When event creation fails, mark the matching attendees as 'failed'
 * so the failure is trackable in the database rather than only in logs.
 */
async function markAttendeesAsFailed(
  appointment: AppointmentType,
  eventShapeId: string,
  errorMessage: string
): Promise<number> {
  const shapeAttendees = await EventShapeAttendee.findAll({
    where: { eventShapeId },
    attributes: ['userTypeBlockInstanceId'],
  })

  const allowedUserTypes = new Set(
    shapeAttendees.map(sa => sa.userTypeBlockInstanceId)
  )

  const appointmentAttendees = (appointment as unknown as { attendees?: AppointmentAttendeeWithUser[] }).attendees ?? []

  const matchingAttendees = allowedUserTypes.size > 0
    ? appointmentAttendees.filter(
        att =>
          att.shouldReceiveInvitation &&
          att.userTypeBlockInstanceId &&
          allowedUserTypes.has(att.userTypeBlockInstanceId)
      )
    : appointmentAttendees.filter(att => att.shouldReceiveInvitation)

  let updated = 0

  for (const attendee of matchingAttendees) {
    try {
      await AppointmentAttendee.update(
        { invitationStatus: 'failed' },
        { where: { id: attendee.id } }
      )
      updated++
    } catch (updateError) {
      logger.error(`Failed to mark attendee ${attendee.id} as failed:`, updateError)
    }
  }

  if (updated > 0) {
    logger.warn(`Marked ${updated} attendee(s) as 'failed' due to: ${errorMessage}`)
  }

  return updated
}

// ─── Time extraction ────────────────────────────────────────────────────────

function extractStartTime(appointment: AppointmentType): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ startTime: string }> | null)?.[0]
  if (!firstSlot?.startTime) {
    throw new Error(`Appointment ${appointment.id} has no selectedTimeSlots — cannot create calendar event`)
  }
  return new Date(firstSlot.startTime).toISOString()
}

function extractEndTime(appointment: AppointmentType): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ endTime: string }> | null)?.[0]
  if (!firstSlot?.endTime) {
    throw new Error(`Appointment ${appointment.id} has no endTime in selectedTimeSlots`)
  }
  return new Date(firstSlot.endTime).toISOString()
}

// ─── Default content (used when templates are empty) ────────────────────────

function buildDefaultSummary(appointment: AppointmentType): string {
  const address = (appointment as unknown as InviteAppointmentData).propertyVersion?.address
  return address ? `Inspection: ${address.streetAddress}` : 'Inspection Appointment'
}

function buildDefaultDescription(appointment: AppointmentType): string {
  return [
    'Home Inspection Appointment',
    '',
    '---',
    'This event was automatically created by the scheduling system.',
    `Appointment ID: ${appointment.id}`,
  ].join('\n')
}

function buildDefaultLocation(appointment: AppointmentType): string {
  const address = (appointment as unknown as InviteAppointmentData).propertyVersion?.address
  if (!address) return ''

  return [address.streetAddress, address.city, address.state, address.zipCode]
    .filter(Boolean)
    .join(', ')
}

// ─── Fallback: legacy single-event behavior ─────────────────────────────────

/**
 * When no EventInstances are found, create a single event using hardcoded
 * defaults. This preserves backward compatibility with the original
 * appointmentCalendarService behavior.
 */
async function createFallbackEvent(
  appointment: AppointmentType,
  calendarId: string
): Promise<InviteOrchestrationResult> {
  const appointmentData = appointment as unknown as InviteAppointmentData & {
    attendees?: AppointmentAttendeeWithUser[]
  }

  try {
    const summary = buildDefaultSummary(appointment)
    const description = buildDefaultDescription(appointment)
    const location = buildDefaultLocation(appointment)
    const attendees = buildAllAttendees(appointment)

    const eventParams: CreateEventParams = {
      calendarId,
      summary,
      description,
      location: location || undefined,
      start: extractStartTime(appointment),
      end: extractEndTime(appointment),
      attendees,
      sendUpdates: 'all',
    }

    const createdEvent = await createEvent(eventParams)

    // Update all attendees who should receive invitations
    const attendeesToUpdate = appointmentData.attendees?.filter(a => a.shouldReceiveInvitation) ?? []
    let attendeesUpdated = 0

    for (const attendee of attendeesToUpdate) {
      try {
        await AppointmentAttendee.update(
          { googleEventId: createdEvent.id, invitationStatus: 'sent' },
          { where: { id: attendee.id } }
        )
        attendeesUpdated++
      } catch (error) {
        logger.error(`Failed to update attendee ${attendee.id}:`, error)
      }
    }

    return {
      appointmentId: appointment.id,
      totalEventsAttempted: 1,
      totalEventsCreated: 1,
      totalAttendeesUpdated: attendeesUpdated,
      events: [{
        eventInstanceId: 'fallback',
        eventInstanceName: 'Legacy fallback event',
        success: true,
        googleEventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        attendeesUpdated,
      }],
      fallbackUsed: true,
    }
  } catch (error) {
    logger.error('Fallback event creation failed:', error)
    return {
      appointmentId: appointment.id,
      totalEventsAttempted: 1,
      totalEventsCreated: 0,
      totalAttendeesUpdated: 0,
      events: [{
        eventInstanceId: 'fallback',
        eventInstanceName: 'Legacy fallback event',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attendeesUpdated: 0,
      }],
      fallbackUsed: true,
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function emptyResult(appointmentId: string): InviteOrchestrationResult {
  return {
    appointmentId,
    totalEventsAttempted: 0,
    totalEventsCreated: 0,
    totalAttendeesUpdated: 0,
    events: [],
    fallbackUsed: false,
  }
}
