
import { Op } from 'sequelize'
import type { AppointmentFeeBreakdownPayload, AppointmentFeeEntryCreate } from '../../../../../shared/types/appointmentFeeTypes.js'
import {
  BusinessSettings,
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
} from '../../../config/app.js'
import { createBlockInstanceVersion } from '../../../services/instanceVersioning.js'
import { getUserTypeBlockIdForRole } from '../../../utils/userTypeMapping.js'
import { createLogger } from '../../../utils/logger.js'
import { DEFAULT_CALENDAR_EMAIL, AVAILABILITY_SETTINGS_KEY, STATUSES_REQUIRING_CALENDAR_EVENT, ERROR_MESSAGES } from './appointmentConstants.js'
import { defaultAvailabilitySettings } from '../businessSettings/businessSettingsConstants.js'
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'
import type { AdminEntryTimeout } from '../../../../../shared/types/calendarTypes.js'

const logger = createLogger('AppointmentRouter')

/** Code fallbacks when admin settings omit hold duration bounds (e.g. legacy data). */
const HOLD_DURATION_MIN_FALLBACK = 1
const HOLD_DURATION_MAX_FALLBACK = 60
const HOLD_DURATION_VALUE_FALLBACK = 15

export interface HoldDurationBounds {
  min: number
  max: number
  fallback: number
}

/** Derive bounds from availability settings data (sync; no DB). */
function holdDurationBoundsFromData(data: AvailabilitySettingsData): HoldDurationBounds {
  const cc = data.calendarConfig
  const minRaw = cc?.holdDurationMin
  const maxRaw = cc?.holdDurationMax
  const fallbackRaw = cc?.holdDurationFallback
  const min = typeof minRaw === 'number' && !Number.isNaN(minRaw) ? Math.floor(minRaw) : HOLD_DURATION_MIN_FALLBACK
  const max = typeof maxRaw === 'number' && !Number.isNaN(maxRaw) ? Math.floor(maxRaw) : HOLD_DURATION_MAX_FALLBACK
  const fallback = typeof fallbackRaw === 'number' && !Number.isNaN(fallbackRaw) ? Math.floor(fallbackRaw) : HOLD_DURATION_VALUE_FALLBACK
  const clampedFallback = Math.min(max, Math.max(min, fallback))
  return { min, max, fallback: clampedFallback }
}

/**
 * Hold duration bounds and fallback from admin availability settings.
 * Uses code fallbacks when settings omit values (e.g. legacy calendarConfig).
 */
export async function getHoldDurationBoundsFromSettings(): Promise<HoldDurationBounds> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  const data: AvailabilitySettingsData = (setting?.settingValue != null)
    ? (setting.settingValue as AvailabilitySettingsData)
    : defaultAvailabilitySettings
  return holdDurationBoundsFromData(data)
}

/**
 * Hold duration bounds and default in one read. Use when both are needed (e.g. router beforeCreate + sanitize).
 */
export async function getHoldDurationFromSettings(): Promise<{ bounds: HoldDurationBounds; defaultMinutes: number }> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  const data: AvailabilitySettingsData = (setting?.settingValue != null)
    ? (setting.settingValue as AvailabilitySettingsData)
    : defaultAvailabilitySettings
  const bounds = holdDurationBoundsFromData(data)
  const raw = data.calendarConfig?.holdDurationMinutes
  const parsed = typeof raw === 'number' && !Number.isNaN(raw) ? Math.floor(raw) : bounds.fallback
  const defaultMinutes = Math.min(bounds.max, Math.max(bounds.min, parsed))
  return { bounds, defaultMinutes }
}

/**
 * Default hold duration (minutes) from admin availability settings.
 * Clamped by min/max from settings; uses fallback when value missing or invalid.
 */
export async function getHoldDurationDefaultFromSettings(): Promise<number> {
  const { defaultMinutes } = await getHoldDurationFromSettings()
  return defaultMinutes
}

/**
 * Admin entry dropdown time-out (X days/weeks) from availability settings.
 * Session 6.8.6 — used to filter list-appointments for the admin entry dropdown.
 */
const DEFAULT_ADMIN_ENTRY_TIMEOUT: AdminEntryTimeout = { value: 30, unit: 'days' }

export async function getAdminEntryTimeoutFromSettings(): Promise<AdminEntryTimeout> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  const data: AvailabilitySettingsData = (setting?.settingValue != null)
    ? (setting.settingValue as AvailabilitySettingsData)
    : defaultAvailabilitySettings
  const raw = data.calendarConfig?.adminEntryTimeout
  if (raw && typeof raw.value === 'number' && !Number.isNaN(raw.value) && (raw.unit === 'days' || raw.unit === 'weeks')) {
    const value = Math.max(1, Math.min(365, Math.floor(raw.value)))
    return { value, unit: raw.unit }
  }
  return DEFAULT_ADMIN_ENTRY_TIMEOUT
}

/**
 * Task 6.3.2.3/6.3.2.4: Whether to auto-confirm appointments created with status 'submitted'.
 * Reads the availability_settings row's auto_confirm_enabled column (default false).
 */
export async function getAutoConfirmEnabledFromSettings(): Promise<boolean> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
    attributes: ['autoConfirmEnabled'],
  })
  return setting?.autoConfirmEnabled === true
}

export async function getWriteToCalendarFromSettings(): Promise<string | undefined> {
  try {
    const setting = await BusinessSettings.findOne({
      where: { settingKey: AVAILABILITY_SETTINGS_KEY },
    })
    
    if (!setting || !setting.settingValue) {
      logger.debug('No availability_settings found, using default calendar')
      return undefined
    }
    
    const settings = setting.settingValue as {
      calendarConfig?: {
        enabled?: boolean
        provider?: string
        calendars?: Array<{
          email?: string
          readFrom?: boolean
          writeTo?: boolean
        }>
      }
    }
    
    const calendarConfig = settings.calendarConfig
    if (!calendarConfig || !calendarConfig.enabled) {
      logger.debug('Calendar integration not enabled')
      return undefined
    }
    
    if (!Array.isArray(calendarConfig.calendars)) {
      logger.error('Invalid calendar config: calendars must be an array')
      return undefined
    }
    
    const writeToEntry = calendarConfig.calendars.find(
      entry => entry.writeTo && entry.email && entry.email.trim() !== ''
    )
    
    if (writeToEntry?.email) {
      logger.debug('Found writeTo calendar', { email: writeToEntry.email })
      return writeToEntry.email.trim()
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
]

export async function createSnapshotsForAppointment(
  blockInstanceIds: string[]
): Promise<string[]> {
  if (!blockInstanceIds || blockInstanceIds.length === 0) {
    return []
  }

  const snapshots = await Promise.all(
    blockInstanceIds.map(async (blockInstanceId) => {
      const version = await createBlockInstanceVersion(blockInstanceId)
      return version.id
    })
  )
  
  return snapshots
}

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

/** Snapshot ID arrays for service/property/option; used by applySnapshotIdsToAppointment. */
export interface AppointmentSnapshotIds {
  serviceIds: string[]
  propertyIds: string[]
  optionIds: string[]
}

/** Record that can receive snapshot IDs (e.g. Appointment instance from create). */
export interface AppointmentRecordWithUpdate {
  update(values: {
    serviceSnapshotIds: string[] | null
    propertySnapshotIds: string[] | null
    optionSnapshotIds: string[] | null
  }): Promise<unknown>
}

/**
 * Create snapshots for service/property/option IDs, validate them, and update the appointment record.
 * Shared by appointmentCrudRouter (afterCreate) and forceCreateRouter (post-create) to avoid duplication.
 */
export async function applySnapshotIdsToAppointment(
  record: AppointmentRecordWithUpdate,
  ids: AppointmentSnapshotIds
): Promise<void> {
  const serviceSnapshotIds = await createSnapshotsForAppointment(ids.serviceIds)
  const propertySnapshotIds = await createSnapshotsForAppointment(ids.propertyIds)
  const optionSnapshotIds = await createSnapshotsForAppointment(ids.optionIds)
  await validateSnapshotIds(serviceSnapshotIds)
  await validateSnapshotIds(propertySnapshotIds)
  await validateSnapshotIds(optionSnapshotIds)
  await record.update({
    serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
    propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
    optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
  })
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
export async function createConstraintOverrideOnRescheduleIfNeeded(
  updatedAppointment: { id: string; selectedDate: Date | string | null; selectedTimeSlots: Array<Record<string, unknown>> | null }
): Promise<void> {
  const existing = await ConstraintOverride.findOne({
    where: { appointmentId: updatedAppointment.id },
    order: [['createdAt', 'DESC']],
  })
  if (!existing) return

  const slots = updatedAppointment.selectedTimeSlots
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
    appointmentId: updatedAppointment.id,
    overriddenViolations: existing.overriddenViolations,
    authorizedById: existing.authorizedById,
    reason: existing.reason,
    slotStart: newSlotStart,
    slotEnd: newSlotEnd,
  })
  logger.info(`Created ConstraintOverride for rescheduled appointment ${updatedAppointment.id} (new slot)`)
}
