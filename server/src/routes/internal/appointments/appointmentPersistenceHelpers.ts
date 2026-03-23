import { Op } from 'sequelize'
import type { AppointmentFeeBreakdownPayload, AppointmentFeeEntryCreate } from '../../../../../shared/types/appointmentFeeTypes.js'
import type { AttendeeRequest } from '@shared/types/appointmentTypes'
import {
  BlockInstanceVersion,
  AppointmentAttendee,
  AppointmentFeeSummary,
  AppointmentFeeEntry,
  ConstraintOverride,
  AppointmentSelectionLine,
} from '../../../config/app.js'
import { loadLegacySelectedTimeSlotsForAppointment } from '../../../repositories/appointmentTimeSlotRepository.js'
import { getUserTypeBlockIdForRole } from '../../../utils/userTypeMapping.js'
import { createLogger } from '../../../utils/logger.js'
import {
  CONSTRAINT_OVERRIDE_FIELDS,
  DEFAULT_CALENDAR_EMAIL,
  ERROR_MESSAGES,
  STATUSES_REQUIRING_CALENDAR_EVENT,
} from './appointmentConstants.js'
import { FIELD_NAMES, SORT_ORDERS } from '../entities/entityConstants.js'
import { getWriteToCalendarFromSettings } from './appointmentSettingsHelpers.js'

export type { AttendeeRequest }

const logger = createLogger('AppointmentRouter')

/**
 * Validate snapshot IDs exist
 *
 * @param snapshotIds - Array of snapshot IDs to validate
 * @throws Error if any snapshot IDs are invalid
 */
async function validateSnapshotIds(snapshotIds: string[]): Promise<void> {
  if (snapshotIds.length === 0) return

  const count = await BlockInstanceVersion.count({
    where: { id: { [Op.in]: snapshotIds } },
  })

  if (count !== snapshotIds.length) {
    throw new Error(ERROR_MESSAGES.INVALID_SNAPSHOT_IDS)
  }
}

/** Every selection line must have a snapshot version after sync. */
export async function validateAppointmentLineSnapshots(appointmentId: string): Promise<void> {
  const lines = await AppointmentSelectionLine.findAll({
    where: { appointmentId },
    attributes: ['snapshotVersionId'],
  })
  if (lines.length === 0) return
  const ids = lines.map((l) => l.snapshotVersionId).filter((v): v is string => Boolean(v))
  if (ids.length !== lines.length) {
    throw new Error(ERROR_MESSAGES.INVALID_SNAPSHOT_IDS)
  }
  await validateSnapshotIds(ids)
}

export async function createAttendeeRecords(
  appointmentId: string,
  attendeesData: AttendeeRequest[]
): Promise<void> {
  if (attendeesData.length === 0) {
    logger.debug(`No attendees provided for appointment ${appointmentId}`)
    return
  }

  logger.debug(`Creating ${attendeesData.length} attendee records`)

  await Promise.all(
    attendeesData.map(async (attendee) => {
      let userTypeBlockInstanceId = attendee.userTypeBlockInstanceId
      if (!userTypeBlockInstanceId && attendee.role) {
        userTypeBlockInstanceId = await getUserTypeBlockIdForRole(attendee.role)
      }

      return AppointmentAttendee.create({
        appointmentId,
        userId: attendee.userId,
        userTypeBlockInstanceId: userTypeBlockInstanceId || null,
        shouldReceiveInvitation: attendee.shouldReceiveInvitation ?? true,
        invitationStatus: 'pending',
      })
    })
  )

  logger.debug(`Created attendee records for appointment ${appointmentId}`)
}

export async function createFeeRecordsForAppointment(
  appointmentId: string,
  feeData: AppointmentFeeBreakdownPayload | null | undefined
): Promise<void> {
  if (!feeData?.summary || !Array.isArray(feeData.entries)) {
    logger.debug(`No fee breakdown provided for appointment ${appointmentId}, skipping fee records`)
    return
  }

  const { summary, entries } = feeData

  const summaryRecord = await AppointmentFeeSummary.create({
    appointmentId,
    baseFeeTotal: summary.baseFeeTotal,
    overageFeeTotal: summary.overageFeeTotal,
    totalFee: summary.totalFee,
    squareFootage: summary.squareFootage,
    aduCount: summary.aduCount,
    currency: summary.currency,
    calculatedAt: new Date(summary.calculatedAt),
  })

  await Promise.all(
    entries.map((entry: AppointmentFeeEntryCreate) =>
      AppointmentFeeEntry.create({
        feeSummaryId: summaryRecord.id,
        blockInstanceId: entry.blockInstanceId,
        blockName: entry.blockName,
        blockShapeRef: entry.blockShapeRef,
        baseFee: entry.baseFee,
        overageFee: entry.overageFee,
        totalFee: entry.totalFee,
        quantity: entry.quantity,
      })
    )
  )

  logger.debug(`Created fee summary and ${entries.length} fee entries for appointment ${appointmentId}`)
}

export function shouldCreateCalendarEvent(status: string): boolean {
  return (STATUSES_REQUIRING_CALENDAR_EVENT as readonly string[]).includes(status)
}

export async function getCalendarIdForAppointment(): Promise<string> {
  const writeToCalendar = await getWriteToCalendarFromSettings()
  const calendarId = writeToCalendar || DEFAULT_CALENDAR_EMAIL

  if (!writeToCalendar) {
    logger.warn(`No writeTo calendar configured, using default: ${calendarId}`)
  }

  return calendarId
}

/**
 * Task 6.8.4.2 — New override on reschedule.
 * When an appointment that has a ConstraintOverride is rescheduled (slot changed),
 * create a new ConstraintOverride record for the new slot so the audit trail is preserved
 * and the new slot remains override-linked.
 */
export async function createConstraintOverrideOnRescheduleIfNeeded(updatedAppointment: {
  id: string
  selectedDate: Date | string | null
}): Promise<void> {
  const existing = await ConstraintOverride.findOne({
    where: { [CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID]: updatedAppointment.id },
    order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
  })
  if (!existing) return

  const slots = await loadLegacySelectedTimeSlotsForAppointment(updatedAppointment.id)
  const first = Array.isArray(slots) && slots.length > 0 ? slots[0] : null
  const startTime = first && typeof first.startTime === 'string' ? first.startTime : null
  const endTime = first && typeof first.endTime === 'string' ? first.endTime : null
  if (!startTime || !endTime) return

  const newSlotStart = new Date(startTime)
  const newSlotEnd = new Date(endTime)
  if (Number.isNaN(newSlotStart.getTime()) || Number.isNaN(newSlotEnd.getTime())) return

  const existingStart = existing.slotStart.getTime()
  const existingEnd = existing.slotEnd.getTime()
  if (newSlotStart.getTime() === existingStart && newSlotEnd.getTime() === existingEnd) return

  await ConstraintOverride.create({
    [CONSTRAINT_OVERRIDE_FIELDS.APPOINTMENT_ID]: updatedAppointment.id,
    overriddenViolations: existing.overriddenViolations,
    authorizedById: existing.authorizedById,
    reason: existing.reason,
    slotStart: newSlotStart,
    slotEnd: newSlotEnd,
  })
  logger.info(`Created ConstraintOverride for rescheduled appointment ${updatedAppointment.id} (new slot)`)
}
