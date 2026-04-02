
import { Op } from 'sequelize'
import { createEvent } from '../google/calendar/eventCreationService.js'
import type { CreateEventParams } from '../google/calendar/calendarTypes.js'
import {
  Appointment,
  BlockInstance,
  EventAssignment,
  EventInstance,
  EventShape,
} from '../../config/app.js'
import { appointmentIncludes } from '../../routes/internal/appointments/appointmentHelpers.js'
import type { EventInstance as EventInstanceType } from '../../db/models/booking/event_instance.js'
import { resolveEventTemplates } from './templateResolver.js'
import { buildInviteContext } from './inviteContextBuilder.js'
import {
  buildAttendeesForEventInstance,
  markAttendeesAsFailed,
  updateAttendeeRecords,
} from './inviteAttendeeHelpers.js'
import { createLogger } from '../../utils/logger.js'
import { UNKNOWN_ERROR_MESSAGE } from '../../constants/router.js'
import { DEFAULT_EVENT_SUMMARY_FALLBACK } from './inviteConstants.js'
import { EMPTY_STRING, nilToEmptyString } from '@shared/utils/nilDefaults.js'
import {
  type AppointmentWithRelations,
  type NormalizedAppointmentForInviteFlow,
  collectBlockInstanceIds,
  linkStripSetForEventShape,
  normalizeAppointmentForInviteFlow,
  toInviteAppointmentData,
} from './inviteAppointmentShared.js'

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

interface InviteOrchestrationResult {
  appointmentId: string
  totalEventsAttempted: number
  totalEventsCreated: number
  totalAttendeesUpdated: number
  events: SingleEventResult[]
  noEventInstances?: boolean
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

  const normalized = normalizeAppointmentForInviteFlow(appointment, { logEmptyArrays: true })
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
    include: appointmentIncludes,
  })
}

async function findEventInstancesForBlockInstances(
  blockInstanceIds: string[]
): Promise<EventInstanceType[]> {
  if (blockInstanceIds.length === 0) return []

  const eventAssignments = await EventAssignment.findAll({
    where: { parentId: { [Op.in]: blockInstanceIds }, disabled: false },
    include: [
      {
        model: EventInstance,
        as: 'eventInstance',
        where: { active: true },
        include: [
          {
            model: EventShape,
            as: 'eventShape',
            attributes: ['id', 'name', 'placementKind', 'anchorEdge'],
            required: true,
          },
        ],
      },
    ],
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
  appointment: NormalizedAppointmentForInviteFlow,
  context: Record<string, string>,
  calendarId: string
): Promise<SingleEventResult> {
  const instanceName = eventInstance.name

  try {
    const inst = eventInstance as EventInstanceType & {
      includeRescheduleLink?: boolean
      includeCancelLink?: boolean
    }
    const stripPlaceholderNames = linkStripSetForEventShape({
      includeRescheduleLink: inst.includeRescheduleLink,
      includeCancelLink: inst.includeCancelLink,
    })

    const resolved = resolveEventTemplates(
      {
        titleTemplate: eventInstance.titleTemplate,
        descriptionTemplate: eventInstance.descriptionTemplate,
        locationTemplate: eventInstance.locationTemplate,
      },
      context,
      stripPlaceholderNames.size > 0 ? { stripPlaceholderNames } : {}
    )

    const summary = resolved.summary || buildDefaultSummary(appointment)
    const description = resolved.description || buildDefaultDescription(appointment)
    const location = resolved.location || buildDefaultLocation(appointment)

    const attendees = await buildAttendeesForEventInstance(eventInstance.id, appointment)

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

    const attendeesUpdated = await updateAttendeeRecords(appointment, eventInstance.id, createdEvent.id)

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
      eventInstance.id,
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

function extractStartTime(appointment: NormalizedAppointmentForInviteFlow): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ startTime: string }> | null)?.[0]
  if (!firstSlot?.startTime) {
    throw new Error(`Appointment ${appointment.id} has no selectedTimeSlots — cannot create calendar event`)
  }
  return new Date(firstSlot.startTime).toISOString()
}

function extractEndTime(appointment: NormalizedAppointmentForInviteFlow): string {
  const firstSlot = (appointment.selectedTimeSlots as Array<{ endTime: string }> | null)?.[0]
  if (!firstSlot?.endTime) {
    throw new Error(`Appointment ${appointment.id} has no endTime in selectedTimeSlots`)
  }
  return new Date(firstSlot.endTime).toISOString()
}


function buildDefaultSummary(appointment: NormalizedAppointmentForInviteFlow): string {
  const address = appointment.propertyVersion?.address as
    | { streetAddress?: string; address?: string }
    | undefined
  const street = address ? nilToEmptyString(address.streetAddress ?? address.address) : EMPTY_STRING
  return street ? `Inspection: ${street}` : DEFAULT_EVENT_SUMMARY_FALLBACK
}

function buildDefaultDescription(appointment: NormalizedAppointmentForInviteFlow): string {
  return [
    'Home Inspection Appointment',
    '',
    '---',
    'This event was automatically created by the scheduling system.',
    `Appointment ID: ${appointment.id}`,
  ].join('\n')
}

function buildDefaultLocation(appointment: NormalizedAppointmentForInviteFlow): string {
  const address = appointment.propertyVersion?.address as
    | { streetAddress?: string; address?: string; city?: string; state?: string; zipCode?: string }
    | undefined
  if (!address) return ''

  const street = nilToEmptyString(address.streetAddress ?? address.address)
  return [street, address.city, address.state, address.zipCode].filter(Boolean).join(', ')
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
