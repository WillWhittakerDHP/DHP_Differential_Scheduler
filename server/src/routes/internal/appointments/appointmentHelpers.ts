/**
 * Appointment Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for appointment operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure functions for complex logic
 */

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

const logger = createLogger('AppointmentRouter')

/**
 * Get the writeTo calendar email from business settings
 * LEARNING: Reads calendarConfig from availability_settings to find calendar with writeTo: true
 * WHY: Appointments should be created on the calendar configured by admin, not hardcoded
 * PATTERN: Helper function to extract writeTo calendar from settings
 * 
 * @returns Calendar email string where writeTo is true, or undefined if not configured
 */
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
    
    // Find calendar with writeTo: true
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

/**
 * Standard includes for appointment queries
 * LEARNING: Centralized include definition for consistency
 * WHY: Includes attendees and fee summary for calendar invitations and fee display
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
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

/**
 * Create snapshots for appointment block instances
 * LEARNING: Creates version snapshots for block instances referenced in appointment
 * WHY: Preserves state of block instances at appointment creation time
 * PATTERN: Map block instance IDs to version snapshots
 * 
 * @param blockInstanceIds - Array of block instance IDs to create snapshots for
 * @returns Array of snapshot version IDs
 */
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
 * LEARNING: Application-level FK validation for arrays
 * WHY: Ensures snapshot IDs are valid before creating appointment
 * PATTERN: Count snapshots and verify all exist
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

/**
 * Create attendee records for an appointment
 * LEARNING: Creates attendee records with role lookup if needed
 * WHY: Handles attendee creation with optional role-based userTypeBlockInstanceId lookup
 * PATTERN: Map attendees, resolve userTypeBlockInstanceId, create records
 * 
 * @param appointmentId - Appointment ID
 * @param attendeesData - Array of attendee request data
 * @returns Promise that resolves when all attendees are created
 */
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
    // If role is provided but not userTypeBlockInstanceId, look it up
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

/**
 * Create fee summary and fee entry records for an appointment
 * LEARNING: Persists fee breakdown at booking time for income constraints and analytics
 * WHY: Normalized tables (appointment_fee_summaries, appointment_fee_entries) enable SUM queries and per-block reporting
 * PATTERN: Same as createAttendeeRecords — create parent (summary) then children (entries) using payload from client
 *
 * @param appointmentId - Appointment ID
 * @param feeData - Fee breakdown payload (summary + entries) from client buildAppointmentFeeBreakdown
 * @returns Promise that resolves when summary and entries are created (no-op if feeData missing)
 */
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

/**
 * Check if appointment status requires calendar event creation
 * LEARNING: Determines if calendar event should be created based on status
 * WHY: Only create calendar events for submitted/confirmed appointments
 * PATTERN: Check status against allowed statuses
 * 
 * @param status - Appointment status
 * @returns true if calendar event should be created
 */
export function shouldCreateCalendarEvent(status: string): boolean {
  return (STATUSES_REQUIRING_CALENDAR_EVENT as readonly string[]).includes(status)
}

/**
 * Get calendar ID for appointment creation
 * LEARNING: Gets writeTo calendar from settings or falls back to default
 * WHY: Provides calendar ID for calendar event creation
 * PATTERN: Try settings first, fallback to default
 * 
 * @returns Calendar email to use for appointment creation
 */
export async function getCalendarIdForAppointment(): Promise<string> {
  const writeToCalendar = await getWriteToCalendarFromSettings()
  const calendarId = writeToCalendar || DEFAULT_CALENDAR_EMAIL
  
  if (!writeToCalendar) {
    logger.warn(`No writeTo calendar configured, using default: ${calendarId}`)
  }
  
  return calendarId
}
