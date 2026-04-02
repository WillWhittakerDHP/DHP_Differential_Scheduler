/**
 * WHY: Admin UI resolves event templates against a real appointment using the same context as invites.
 */
import { Appointment, BlockInstance, EventInstance } from '../../config/app.js'
import { appointmentIncludes } from '../../routes/internal/appointments/appointmentHelpers.js'
import { buildInviteContext } from './inviteContextBuilder.js'
import { resolveEventTemplates } from './templateResolver.js'
import { createLogger } from '../../utils/logger.js'
import type { EventInstancePreviewRequestBody, EventInstancePreviewResponseBody } from '@shared/types/eventInstancePreview.js'
import {
  type AppointmentWithRelations,
  collectBlockInstanceIds,
  linkStripSetForEventShape,
  normalizeAppointmentForInviteFlow,
  toInviteAppointmentData,
} from './inviteAppointmentShared.js'

const logger = createLogger('EventInstancePreviewService')

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

  const segment = await EventInstance.findByPk(body.eventInstanceId, {
    attributes: ['includeRescheduleLink', 'includeCancelLink'],
  })
  if (!segment) {
    logger.warn('Event instance preview: event instance not found', { eventInstanceId: body.eventInstanceId })
    throw new Error('Event instance not found')
  }

  const normalized = normalizeAppointmentForInviteFlow(appointment, { logEmptyArrays: false })
  const blockIds = collectBlockInstanceIds(normalized)
  const serviceName = await resolveServiceName(blockIds)
  const inviteData = toInviteAppointmentData(normalized)
  const context = buildInviteContext(inviteData, serviceName)

  const stripPlaceholderNames = linkStripSetForEventShape(segment)
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
