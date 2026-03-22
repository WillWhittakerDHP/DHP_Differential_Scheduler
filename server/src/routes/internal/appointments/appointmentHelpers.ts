
import { Op } from 'sequelize'
import type { AppointmentFeeBreakdownPayload, AppointmentFeeEntryCreate } from '../../../../../shared/types/appointmentFeeTypes.js'
import {
  BlockInstanceVersion,
  AppointmentAttendee,
  AppointmentFeeSummary,
  AppointmentFeeEntry,
  PropertyVersion,
  Address,
  PropertyDetails,
  User,
  BlockInstance,
  ConstraintOverride,
  AppointmentSelectionLine,
  AppointmentTimeSlot,
} from '../../../config/app.js'
import { loadLegacySelectedTimeSlotsForAppointment } from '../../../repositories/appointmentTimeSlotRepository.js'
import { getCalendarSettings } from '../../../repositories/calendarSettingsRepository.js'
import { syncSelectionsAndSnapshotsFromBody } from '../../../repositories/appointmentSelectionRepository.js'
import { getUserTypeBlockIdForRole } from '../../../utils/userTypeMapping.js'
import { createLogger } from '../../../utils/logger.js'
import { DEFAULT_CALENDAR_EMAIL, STATUSES_REQUIRING_CALENDAR_EVENT, ERROR_MESSAGES, CONSTRAINT_OVERRIDE_FIELDS } from './appointmentConstants.js'
import { FIELD_NAMES, SORT_ORDERS } from '../entities/entityConstants.js'
import type { CalendarSettingsData } from '../../../db/models/admin/calendar_settings.js'
import type { AdminEntryTimeout } from '../../../../../shared/types/calendarTypes.js'

const logger = createLogger('AppointmentRouter')

const HOLD_DURATION_MIN_FALLBACK = 1
const HOLD_DURATION_MAX_FALLBACK = 60
const HOLD_DURATION_VALUE_FALLBACK = 15

export interface HoldDurationBounds {
  min: number
  max: number
  fallback: number
}

/** Derive bounds from calendar settings (sync; no DB). */
function holdDurationBoundsFromCalendarData(data: CalendarSettingsData): HoldDurationBounds {
  const minRaw = data.holdDurationMin
  const maxRaw = data.holdDurationMax
  const fallbackRaw = data.holdDurationFallback
  const min = typeof minRaw === 'number' && !Number.isNaN(minRaw) ? Math.floor(minRaw) : HOLD_DURATION_MIN_FALLBACK
  const max = typeof maxRaw === 'number' && !Number.isNaN(maxRaw) ? Math.floor(maxRaw) : HOLD_DURATION_MAX_FALLBACK
  const fallback = typeof fallbackRaw === 'number' && !Number.isNaN(fallbackRaw) ? Math.floor(fallbackRaw) : HOLD_DURATION_VALUE_FALLBACK
  const clampedFallback = Math.min(max, Math.max(min, fallback))
  return { min, max, fallback: clampedFallback }
}

/** Hold duration bounds and fallback from calendar_settings. */
export async function getHoldDurationBoundsFromSettings(): Promise<HoldDurationBounds> {
  const data = await getCalendarSettings()
  return holdDurationBoundsFromCalendarData(data)
}

/** Hold duration bounds and default in one read. */
export async function getHoldDurationFromSettings(): Promise<{ bounds: HoldDurationBounds; defaultMinutes: number }> {
  const data = await getCalendarSettings()
  const bounds = holdDurationBoundsFromCalendarData(data)
  const raw = data.holdDurationMinutes
  const parsed = typeof raw === 'number' && !Number.isNaN(raw) ? Math.floor(raw) : bounds.fallback
  const defaultMinutes = Math.min(bounds.max, Math.max(bounds.min, parsed))
  return { bounds, defaultMinutes }
}

/** Default hold duration (minutes) from calendar_settings. */
export async function getHoldDurationDefaultFromSettings(): Promise<number> {
  const { defaultMinutes } = await getHoldDurationFromSettings()
  return defaultMinutes
}

const DEFAULT_ADMIN_ENTRY_TIMEOUT: AdminEntryTimeout = { value: 30, unit: 'days' }

/** Admin entry dropdown time-out from calendar_settings. */
export async function getAdminEntryTimeoutFromSettings(): Promise<AdminEntryTimeout> {
  const data = await getCalendarSettings()
  const raw = data.adminEntryTimeout
  if (raw && typeof raw.value === 'number' && !Number.isNaN(raw.value) && (raw.unit === 'days' || raw.unit === 'weeks')) {
    const value = Math.max(1, Math.min(365, Math.floor(raw.value)))
    return { value, unit: raw.unit }
  }
  return DEFAULT_ADMIN_ENTRY_TIMEOUT
}

/** Whether to auto-confirm appointments (from calendar_settings). */
export async function getAutoConfirmEnabledFromSettings(): Promise<boolean> {
  const data = await getCalendarSettings()
  return data.autoConfirmEnabled === true
}

function findWriteToCalendarEmail(calendars: Array<{ email?: string; writeTo?: boolean }>): string | undefined {
  const entry = calendars.find(e => e.writeTo && e.email?.trim())
  return entry?.email?.trim()
}

/** Email of the calendar configured for write operations, or undefined if none. */
export async function getWriteToCalendarFromSettings(): Promise<string | undefined> {
  try {
    const data = await getCalendarSettings()
    if (!data.enabled || !Array.isArray(data.calendars)) {
      logger.debug('Calendar integration not enabled or invalid config')
      return undefined
    }
    const email = findWriteToCalendarEmail(data.calendars)
    if (email) {
      logger.debug('Found writeTo calendar', { email })
      return email
    }
    logger.debug('No writeTo calendar configured')
    return undefined
  } catch (error) {
    logger.error('Error reading writeTo calendar from settings', { error })
    return undefined
  }
}

export const appointmentIncludes = [
  {
    model: PropertyVersion,
    as: 'propertyVersion',
    include: [
      { model: Address, as: 'address' },
      { model: PropertyDetails, as: 'propertyDetails' },
    ],
  },
  {
    model: AppointmentAttendee,
    as: 'attendees',
    include: [
      { model: User, as: 'user' },
      { model: BlockInstance, as: 'userTypeBlockInstance' },
    ],
  },
  {
    model: AppointmentFeeSummary,
    as: 'feeSummary',
    include: [{ model: AppointmentFeeEntry, as: 'feeEntries' }],
  },
  {
    model: AppointmentSelectionLine,
    as: 'selectionLines',
    separate: true,
  },
  {
    model: AppointmentTimeSlot,
    as: 'timeSlots',
    separate: true,
  },
]

/**
 * Validate snapshot IDs exist
 * 
 * @param snapshotIds - Array of snapshot IDs to validate
 * @throws Error if any snapshot IDs are invalid
 */
export async function validateSnapshotIds(snapshotIds: string[]): Promise<void> {
  if (snapshotIds.length === 0) return

  const count = await BlockInstanceVersion.count({
    where: { id: { [Op.in]: snapshotIds } },
  })

  if (count !== snapshotIds.length) {
    throw new Error(ERROR_MESSAGES.INVALID_SNAPSHOT_IDS)
  }
}

/** Snapshot ID arrays for service/property/option; legacy hook for ids-only flows. */
export interface AppointmentSnapshotIds {
  serviceIds: string[]
  propertyIds: string[]
  optionIds: string[]
}

/**
 * Persist selection lines and block_instance_versions for service/property/option IDs (quantity defaults to 1).
 * Prefer syncSelectionsAndSnapshotsFromBody(record.id, fullBody) when quantities are present.
 */
export async function applySnapshotIdsToAppointment(
  record: { id: string },
  ids: AppointmentSnapshotIds
): Promise<void> {
  await syncSelectionsAndSnapshotsFromBody(record.id, {
    selectedServiceIds: ids.serviceIds,
    selectedPropertyIds: ids.propertyIds,
    selectedOptionIds: ids.optionIds,
  })
  await validateAppointmentLineSnapshots(record.id)
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

/** Re-export from shared for single source of truth. */
import type { AttendeeRequest } from '@shared/types/appointmentTypes'
export type { AttendeeRequest }

export async function createAttendeeRecords(
  appointmentId: string,
  attendeesData: AttendeeRequest[]
): Promise<void> {
  if (attendeesData.length === 0) {
    logger.debug(`No attendees provided for appointment ${appointmentId}`)
    return
  }
  
  logger.debug(`Creating ${attendeesData.length} attendee records`)
  
  await Promise.all(attendeesData.map(async (attendee) => {
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
  }))
  
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
