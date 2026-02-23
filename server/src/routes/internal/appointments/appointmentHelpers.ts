
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
} from '../../../config/app.js'
import { createBlockInstanceVersion } from '../../../services/instanceVersioning.js'
import { getUserTypeBlockIdForRole } from '../../../utils/userTypeMapping.js'
import { createLogger } from '../../../utils/logger.js'
import { DEFAULT_CALENDAR_EMAIL, AVAILABILITY_SETTINGS_KEY, STATUSES_REQUIRING_CALENDAR_EVENT, ERROR_MESSAGES } from './appointmentConstants.js'
import { defaultAvailabilitySettings } from '../businessSettings/businessSettingsConstants.js'
import type { AvailabilitySettingsData } from '../../../db/models/admin/business_settings.js'

const logger = createLogger('AppointmentRouter')

const HOLD_DURATION_MIN = 1
const HOLD_DURATION_MAX = 60
const HOLD_DURATION_FALLBACK = 15

/**
 * Default hold duration (minutes) from admin availability settings.
 * WHY: Server takes its cue from admin settings; no hardcoded fallback in router.
 */
export async function getHoldDurationDefaultFromSettings(): Promise<number> {
  const setting = await BusinessSettings.findOne({
    where: { settingKey: AVAILABILITY_SETTINGS_KEY },
  })
  const data: AvailabilitySettingsData = (setting?.settingValue != null)
    ? (setting.settingValue as AvailabilitySettingsData)
    : defaultAvailabilitySettings
  const raw = data.calendarConfig?.holdDurationMinutes
  const parsed = typeof raw === 'number' && !Number.isNaN(raw) ? Math.floor(raw) : HOLD_DURATION_FALLBACK
  return Math.min(HOLD_DURATION_MAX, Math.max(HOLD_DURATION_MIN, parsed))
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
    where: { id: { [Op.in]: snapshotIds } }
  })
  
  if (count !== snapshotIds.length) {
    throw new Error(ERROR_MESSAGES.INVALID_SNAPSHOT_IDS)
  }
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
