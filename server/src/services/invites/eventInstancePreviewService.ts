/**
 * WHY: Admin UI resolves event templates against a real appointment using the same context as invites.
 */
import { Appointment, BlockInstance, EventShape } from '../../config/app.js'
import { appointmentIncludes } from '../../routes/internal/appointments/appointmentHelpers.js'
import type { Appointment as AppointmentType } from '../../db/models/booking/appointment.js'
import { buildInviteContext, type InviteAppointmentData } from './inviteContextBuilder.js'
import { resolveEventTemplates } from './templateResolver.js'
import { createLogger } from '../../utils/logger.js'
import type { EventInstancePreviewRequestBody, EventInstancePreviewResponseBody } from '@shared/types/eventInstancePreview.js'

const logger = createLogger('EventInstancePreviewService')

interface AppointmentAttendeeWithUser {
  id: string
  userId: string
  userTypeBlockInstanceId: string | null
  shouldReceiveInvitation: boolean
  invitationStatus: string
}

interface AppointmentWithRelations extends AppointmentType {
  attendees?: AppointmentAttendeeWithUser[]
  propertyVersion?: InviteAppointmentData['propertyVersion']
}

interface NormalizedAppointmentForPreview {
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

function linkStripSetForEventShape(
  shape: { includeRescheduleLink?: boolean; includeCancelLink?: boolean } | null | undefined
): Set<string> {
  const strip = new Set<string>()
  if (shape?.includeRescheduleLink === false) {
    strip.add('rescheduleLink')
  }
  if (shape?.includeCancelLink === false) {
    strip.add('cancelLink')
  }
  return strip
}

function asArrayOrEmpty<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function normalizeAppointmentForPreview(raw: AppointmentWithRelations): NormalizedAppointmentForPreview {
  const j = raw.toJSON() as Record<string, unknown>
  const id = String(j.id)
  return {
    id,
    selectedDate: (j.selectedDate as Date | null) ?? null,
    selectedTimeSlots: (j.selectedTimeSlots as Array<Record<string, unknown>> | null) ?? null,
    status: j.status as NormalizedAppointmentForPreview['status'],
    propertyVersion: raw.propertyVersion,
    selectedServiceIds: asArrayOrEmpty(j.selectedServiceIds as string[] | null | undefined),
    selectedPropertyIds: asArrayOrEmpty(j.selectedPropertyIds as string[] | null | undefined),
    selectedOptionIds: asArrayOrEmpty(j.selectedOptionIds as string[] | null | undefined),
    attendees: asArrayOrEmpty(raw.attendees),
  }
}

function toInviteAppointmentData(appointment: NormalizedAppointmentForPreview): InviteAppointmentData {
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

function collectBlockInstanceIds(appointment: NormalizedAppointmentForPreview): string[] {
  return [
    ...appointment.selectedServiceIds,
    ...appointment.selectedPropertyIds,
    ...appointment.selectedOptionIds,
  ]
}

async function resolveServiceName(blockInstanceIds: string[]): Promise<string | undefined> {
  if (blockInstanceIds.length === 0) return undefined
  const firstBlock = await BlockInstance.findByPk(blockInstanceIds[0], { attributes: ['name'] })
  return firstBlock?.name ?? undefined
}

async function fetchAppointmentWithRelations(appointmentId: string): Promise<AppointmentWithRelations | null> {
  return Appointment.findByPk(appointmentId, { include: appointmentIncludes })
}

export async function previewEventInstanceTemplates(
  body: EventInstancePreviewRequestBody
): Promise<EventInstancePreviewResponseBody> {
  const appointment = await fetchAppointmentWithRelations(body.appointmentId)
  if (!appointment) {
    logger.warn('Event instance preview: appointment not found', { appointmentId: body.appointmentId })
    throw new Error('Appointment not found')
  }

  const eventShape = await EventShape.findByPk(body.eventShapeRef, {
    attributes: ['id', 'includeRescheduleLink', 'includeCancelLink'],
  })

  const normalized = normalizeAppointmentForPreview(appointment)
  const blockIds = collectBlockInstanceIds(normalized)
  const serviceName = await resolveServiceName(blockIds)
  const inviteData = toInviteAppointmentData(normalized)
  const context = buildInviteContext(inviteData, serviceName)

  const stripPlaceholderNames = linkStripSetForEventShape(eventShape)
  const options = stripPlaceholderNames.size > 0 ? { stripPlaceholderNames } : {}

  return resolveEventTemplates(
    {
      titleTemplate: body.titleTemplate,
      descriptionTemplate: body.descriptionTemplate,
      locationTemplate: body.locationTemplate,
    },
    context,
    options
  )
}
