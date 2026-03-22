
import { Op } from 'sequelize'
import { createEvent } from '../google/calendar/eventCreationService.js'
import type { CreateEventParams } from '../google/calendar/calendarTypes.js'
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
} from '../../config/app.js'
import type { Appointment as AppointmentType } from '../../db/models/booking/appointment.js'
import type { EventInstance as EventInstanceType } from '../../db/models/booking/event_instance.js'
import { resolveEventTemplates } from './templateResolver.js'
import { buildInviteContext, type InviteAppointmentData } from './inviteContextBuilder.js'
import {
  buildAttendeesForEventShape,
  markAttendeesAsFailed,
  updateAttendeeRecords,
} from './inviteAttendeeHelpers.js'
import { createLogger } from '../../utils/logger.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../constants/router.js'
import { DEFAULT_EVENT_SUMMARY_FALLBACK } from './inviteConstants.js'

const logger = createLogger('InviteOrchestrationService')


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
  noEventInstances?: boolean
}

/** Plain appointment shape with array fields guaranteed for invite orchestration; no Model methods. */
interface NormalizedAppointmentForInvites {
  id: string
  selectedDate: Date | null
  selectedTimeSlots: Array<Record<string, unknown>> | null
  status: AppointmentType['status']
  propertyVersion?: InviteAppointmentData['propertyVersion']
  selectedServiceIds: string[]
  selectedPropertyIds: string[]
  selectedOptionIds: string[]
  attendees: AppointmentAttendeeWithUser[]
}

function asArrayOrLogEmpty<T>(value: T[] | null | undefined, appointmentId: string, field: string): T[] {
  if (Array.isArray(value)) return value
  logger.debug('Invite orchestration: normalizing null/undefined to []', { appointmentId, field })
  return []
}

function normalizeAppointmentForInvites(raw: AppointmentWithRelations): NormalizedAppointmentForInvites {
  return {
    id: raw.id,
    selectedDate: raw.selectedDate,
    selectedTimeSlots: raw.selectedTimeSlots,
    status: raw.status,
    propertyVersion: raw.propertyVersion,
    selectedServiceIds: asArrayOrLogEmpty(raw.selectedServiceIds, raw.id, 'selectedServiceIds'),
    selectedPropertyIds: asArrayOrLogEmpty(raw.selectedPropertyIds, raw.id, 'selectedPropertyIds'),
    selectedOptionIds: asArrayOrLogEmpty(raw.selectedOptionIds, raw.id, 'selectedOptionIds'),
    attendees: asArrayOrLogEmpty(raw.attendees, raw.id, 'attendees'),
  }
}


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

  const normalized = normalizeAppointmentForInvites(appointment)
  const selectedBlockInstanceIds = collectBlockInstanceIds(normalized)
  const eventInstances = await findEventInstancesForBlockInstances(selectedBlockInstanceIds)

  if (eventInstances.length === 0) {
    logger.info('No EventInstances found for appointment — calendar invites skipped')
    return {
      appointmentId,
      totalEventsAttempted: 0,
      totalEventsCreated: 0,
      totalAttendeesUpdated: 0,
      events: [],
      noEventInstances: true,
    }
  }

  logger.info(`Found ${eventInstances.length} EventInstance(s) for appointment`)

  const serviceName = await resolveServiceName(selectedBlockInstanceIds)
  const inviteData = toInviteAppointmentData(normalized)
  const context = buildInviteContext(inviteData, serviceName)

  const events: SingleEventResult[] = []
  let totalAttendeesUpdated = 0

  for (const eventInstance of eventInstances) {
    const result = await createEventForInstance(
      eventInstance,
      normalized,
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
  }
}


async function fetchAppointmentWithRelations(appointmentId: string): Promise<AppointmentWithRelations | null> {
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

function toInviteAppointmentData(appointment: NormalizedAppointmentForInvites): InviteAppointmentData {
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

function collectBlockInstanceIds(appointment: NormalizedAppointmentForInvites): string[] {
  return [
    ...appointment.selectedServiceIds,
    ...appointment.selectedPropertyIds,
    ...appointment.selectedOptionIds,
  ]
}

async function findEventInstancesForBlockInstances(
  blockInstanceIds: string[]
): Promise<EventInstanceType[]> {
  if (blockInstanceIds.length === 0) return []

  const partAssignments = await PartAssignment.findAll({
    where: { parentId: { [Op.in]: blockInstanceIds } },
    attributes: ['childId'],
  })
  const partInstanceIds = partAssignments.map(pa => pa.childId)

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

async function resolveServiceName(blockInstanceIds: string[]): Promise<string | undefined> {
  if (blockInstanceIds.length === 0) return undefined

  const firstBlock = await BlockInstance.findByPk(blockInstanceIds[0], {
    attributes: ['name'],
  })
  return firstBlock?.name ?? undefined
}


async function createEventForInstance(
  eventInstance: EventInstanceType,
  appointment: NormalizedAppointmentForInvites,
  context: Record<string, string>,
  calendarId: string
): Promise<SingleEventResult> {
  const instanceName = eventInstance.name

  try {
    const resolved = resolveEventTemplates(
      {
        titleTemplate: eventInstance.titleTemplate,
        descriptionTemplate: eventInstance.descriptionTemplate,
        locationTemplate: eventInstance.locationTemplate,
      },
      context
    )

    const summary = resolved.summary || buildDefaultSummary(appointment)
    const description = resolved.description || buildDefaultDescription(appointment)
    const location = resolved.location || buildDefaultLocation(appointment)

    const attendees = await buildAttendeesForEventShape(
      eventInstance.eventShapeRef,
      appointment
    )

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

    const failedCount = await markAttendeesAsFailed(
      appointment,
      eventInstance.eventShapeRef,
      error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
    )

    return {
      eventInstanceId: eventInstance.id,
      eventInstanceName: instanceName,
      success: false,
      error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      attendeesUpdated: failedCount,
    }
  }
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

/** Appointment as returned by fetchAppointmentWithRelations with eager-loaded associations. */
interface AppointmentWithRelations extends AppointmentType {
  attendees?: AppointmentAttendeeWithUser[]
  propertyVersion?: InviteAppointmentData['propertyVersion']
}


function extractStartTime(appointment: NormalizedAppointmentForInvites): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ startTime: string }> | null)?.[0]
  if (!firstSlot?.startTime) {
    throw new Error(`Appointment ${appointment.id} has no selectedTimeSlots — cannot create calendar event`)
  }
  return new Date(firstSlot.startTime).toISOString()
}

function extractEndTime(appointment: NormalizedAppointmentForInvites): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ endTime: string }> | null)?.[0]
  if (!firstSlot?.endTime) {
    throw new Error(`Appointment ${appointment.id} has no endTime in selectedTimeSlots`)
  }
  return new Date(firstSlot.endTime).toISOString()
}


function buildDefaultSummary(appointment: NormalizedAppointmentForInvites): string {
  const address = appointment.propertyVersion?.address
  return address ? `Inspection: ${address.streetAddress}` : DEFAULT_EVENT_SUMMARY_FALLBACK
}

function buildDefaultDescription(appointment: NormalizedAppointmentForInvites): string {
  return [
    'Home Inspection Appointment',
    '',
    '---',
    'This event was automatically created by the scheduling system.',
    `Appointment ID: ${appointment.id}`,
  ].join('\n')
}

function buildDefaultLocation(appointment: NormalizedAppointmentForInvites): string {
  const address = appointment.propertyVersion?.address
  if (!address) return ''

  return [address.streetAddress, address.city, address.state, address.zipCode]
    .filter(Boolean)
    .join(', ')
}

function emptyResult(appointmentId: string): InviteOrchestrationResult {
  return {
    appointmentId,
    totalEventsAttempted: 0,
    totalEventsCreated: 0,
    totalAttendeesUpdated: 0,
    events: [],
  }
}
