/**
 * Differential Scheduling Utilities
 *
 * LEARNING: Calculation functions for differential scheduling (major and minor arrival times)
 * WHY: Supports services where major attendee arrives earlier than minor attendee
 * PATTERN: Pure functions for calculating major and minor start times
 * Session 1.3.7: Client-Side Availability Calculations
 *
 * NOTE: "Major" and "minor" are configurable via AvailabilitySettings.differentialPerspectives.
 * When not configured, name-based lookup (Major/Minor) is used.
 */

import { createLogger } from '@/utils/logger'
import { createTimeRange, createTimeRangesFromSlotShape, findEventFinalByName } from './booking/appointmentSlotBuilder'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity, GlobalEntityId } from '@/types/entities'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { EventFinal, AppointmentSlot } from '@/types/appointment'

const logger = createLogger('differentialScheduling')

function resolveAttendeeIds(
  perspectives: AvailabilitySettings['differentialPerspectives'],
  context: string
): { major: GlobalEntityId[]; minor: GlobalEntityId[] } {
  const rawMajor = perspectives?.majorAttendees
  const rawMinor = perspectives?.minorAttendees
  if (rawMajor === undefined || rawMajor === null) {
    logger.debug(`${context}: majorAttendees missing, using []`)
  }
  if (rawMinor === undefined || rawMinor === null) {
    logger.debug(`${context}: minorAttendees missing, using []`)
  }
  return {
    major: rawMajor !== undefined && rawMajor !== null ? rawMajor : [],
    minor: rawMinor !== undefined && rawMinor !== null ? rawMinor : [],
  }
}

function durationMinutes(eventFinal: EventFinal | undefined, context: string): number {
  if (eventFinal === undefined) {
    logger.debug(`${context}: no event final, duration 0`)
    return 0
  }
  const d = eventFinal.roundedDuration
  return d !== undefined && d !== null ? d : 0
}

function eventShapeName(eventFinal: EventFinal | undefined, defaultName: string, context: string): string {
  if (eventFinal === undefined) {
    logger.debug(`${context}: no event final, name "${defaultName}"`)
    return defaultName
  }
  const name = eventFinal.eventShape?.name
  return name !== undefined && name !== null && name !== '' ? name : defaultName
}

type SlotShapeWithFinals = AppointmentSlot['shape']['slotShape']

/** Resolve major and minor EventFinal from slotShape (attendee-based or name-based). */
function resolveMajorMinorEventFinals(
  slotShape: SlotShapeWithFinals,
  globalData: GlobalData | undefined,
  availabilitySettings: AvailabilitySettings | null | undefined,
  context: string
): {
  majorEventFinal: EventFinal | undefined
  minorEventFinal: EventFinal | undefined
} {
  let majorEventFinal: EventFinal | undefined
  let minorEventFinal: EventFinal | undefined
  if (globalData && slotShape.eventFinals && availabilitySettings?.differentialPerspectives) {
    const { major: majorAttendeeIds, minor: minorAttendeeIds } = resolveAttendeeIds(
      availabilitySettings.differentialPerspectives,
      context
    )
    const eventShapeEntities = slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    const majorEventShape = majorAttendeeIds.length > 0 ? getMajorEventShape(eventShapeEntities, majorAttendeeIds) : null
    const eventShapesExcludingMajor = majorEventShape
      ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
      : eventShapeEntities
    const minorEventShape = minorAttendeeIds.length > 0 ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds) : null
    majorEventFinal = majorEventShape ? slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id) : undefined
    minorEventFinal = minorEventShape ? slotShape.eventFinals.find(ef => ef.eventShape.id === minorEventShape.id) : undefined
  }
  if (!majorEventFinal) majorEventFinal = findEventFinalByName(slotShape, 'Major')
  if (!minorEventFinal) minorEventFinal = findEventFinalByName(slotShape, 'Minor')
  return { majorEventFinal, minorEventFinal }
}

/**
 * Calculate major start time from minor start time
 * LEARNING: Major arrives earlier: majorStart = minorStart - majorTotal
 * WHY: Major needs time to prepare before minor arrives
 * PATTERN: Subtract majorTotal minutes from minor start time
 * 
 * @param minorStartTime - Minor start time as ISO date string
 * @param majorTotal - Total minutes major needs before minor arrives
 * @returns Major start time as ISO date string
 */
export function calculateMajorStartTime(minorStartTime: string, majorTotal: number): string {
  const minorStart = new Date(minorStartTime)
  const majorStart = new Date(minorStart)
  
  // LEARNING: Subtract majorTotal minutes from minor start time using UTC
  // WHY: Major arrives earlier to prepare; use UTC to match ISO string format
  // PATTERN: Use setUTCMinutes to subtract time in UTC
  majorStart.setUTCMinutes(majorStart.getUTCMinutes() - majorTotal)
  
  // WHY: Prevent midnight rollover issues - major should arrive on same day as minor
  // PATTERN: Check if UTC date changed, reset to 9:00 AM UTC on same day if needed
  if (majorStart.getUTCDate() !== minorStart.getUTCDate()) {
    majorStart.setUTCDate(minorStart.getUTCDate())
    majorStart.setUTCHours(9, 0, 0, 0) // Clamp to 9:00 AM UTC on same day
  }
  
  return majorStart.toISOString()
}

/**
 * Calculate minor start time (for non-differential services, same as selected slot)
 * LEARNING: For differential services, minor arrives at selected slot time
 * WHY: Minor start time is the selected time slot
 * PATTERN: Return selected slot time directly
 * 
 * @param selectedSlotTime - Selected time slot as ISO date string
 * @returns Minor start time as ISO date string (same as selected slot for now)
 */
export function calculateMinorStartTime(selectedSlotTime: string): string {
  // PATTERN: Return selected slot time directly
  return selectedSlotTime
}

export function calculatePropertyAdjustments(_propertyDetails?: Record<string, unknown> | null): number {
  return 0
}

/**
 * Calculate minor start time from major start time
 * LEARNING: Minor arrives later: minorStart = majorStart + majorTotal
 * WHY: For differential scheduling, minor arrives after major has prepared
 * PATTERN: Add majorTotal minutes to major start time
 * 
 * @param majorStartTime - Major start time as ISO date string
 * @param majorTotal - Total minutes major needs before minor arrives
 * @returns Minor start time as ISO date string
 */
export function calculateMinorStartTimeFromMajor(majorStartTime: string, majorTotal: number): string {
  const majorStart = new Date(majorStartTime)
  const minorStart = new Date(majorStart)
  
  // PATTERN: Use setUTCMinutes to add time in UTC
  minorStart.setUTCMinutes(minorStart.getUTCMinutes() + majorTotal)
  
  return minorStart.toISOString()
}

/**
 * Transform AppointmentSlot to major perspective
 * LEARNING: Creates AppointmentSlot with time slots calculated from major start time
 * WHY: Provides major perspective time slots for UI display
 * PATTERN: Use major start time as base, calculate all category time slots from that base
 * 
 * @param appointmentSlot - AppointmentSlot object (may have null TimeSlots)
 * @param majorStartTime - Major start time as ISO date string
 * @param globalData - Optional GlobalData for attendee-based logic
 * @param availabilitySettings - Optional AvailabilitySettings for major/minor attendee configuration
 * @returns AppointmentSlot with TimeSlot objects calculated from major start time
 */
export function transformToMajorPerspective(
  appointmentSlot: AppointmentSlot,
  majorStartTime: string,
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): AppointmentSlot {
  const slotShape = appointmentSlot.shape.slotShape
  const { majorEventFinal, minorEventFinal } = resolveMajorMinorEventFinals(
    slotShape,
    globalData,
    availabilitySettings,
    'transformToMajorPerspective'
  )

  const majorDuration = durationMinutes(majorEventFinal, 'transformToMajorPerspective.major')
  const minorDuration = durationMinutes(minorEventFinal, 'transformToMajorPerspective.minor')

  // PATTERN: Add majorDuration to major start time
  const minorStartTime = calculateMinorStartTimeFromMajor(majorStartTime, majorDuration)

  // WHY: Transform slot to use major start time as base
  // PATTERN: Use createTimeRangesFromSlotShape utility
  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)

  // PATTERN: Use event shape names to look up time ranges (name-based keys when not configured)
  const majorEventName = eventShapeName(majorEventFinal, 'Major', 'transformToMajorPerspective')
  const minorEventName = eventShapeName(minorEventFinal, 'Minor', 'transformToMajorPerspective')
  
  const majorTimeRange = timeRanges.eventTimeRanges?.[majorEventName]
  let minorTimeRange = timeRanges.eventTimeRanges?.[minorEventName]
  
  if (majorTimeRange && minorDuration > 0 && slotShape.roundedDifferentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.roundedDifferentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    } else {
      minorTimeRange = null
    }
  }
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (minorTimeRange) {
    adjustedEventTimeRanges[minorEventName] = minorTimeRange
  }
  
  return {
    ...appointmentSlot,
    startTime: majorStartTime,
    totalTimeRange: timeRanges.totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}

/**
 * Transform AppointmentSlot to minor perspective
 * LEARNING: Creates AppointmentSlot with time slots calculated from minor start time
 * WHY: Provides minor perspective time slots for UI display
 * PATTERN: Use minor start time as base, calculate major times backwards from that base
 * 
 * @param appointmentSlot - AppointmentSlot object (may have null TimeSlots)
 * @param minorStartTime - Minor start time as ISO date string
 * @param globalData - Optional GlobalData for attendee-based logic
 * @param availabilitySettings - Optional AvailabilitySettings for major/minor attendee configuration
 * @returns AppointmentSlot with TimeSlot objects calculated from minor start time
 */
export function transformToMinorPerspective(
  appointmentSlot: AppointmentSlot,
  minorStartTime: string,
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): AppointmentSlot {
  const slotShape = appointmentSlot.shape.slotShape
  const { majorEventFinal, minorEventFinal } = resolveMajorMinorEventFinals(
    slotShape,
    globalData,
    availabilitySettings,
    'transformToMinorPerspective'
  )

  const majorTotal = durationMinutes(majorEventFinal, 'transformToMinorPerspective.major')

  // PATTERN: Subtract majorTotal from minor start time
  const majorStartTime = calculateMajorStartTime(minorStartTime, majorTotal)

  // WHY: Transform slot to use major start time as base for major work
  // PATTERN: Use createTimeRangesFromSlotShape utility with major start time
  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)

  // PATTERN: Use event shape names to look up time ranges (name-based keys when not configured)
  const majorEventName = eventShapeName(majorEventFinal, 'Major', 'transformToMinorPerspective')
  const minorEventName = eventShapeName(minorEventFinal, 'Minor', 'transformToMinorPerspective')

  const majorTimeRange = timeRanges.eventTimeRanges?.[majorEventName]
  const minorDuration = durationMinutes(minorEventFinal, 'transformToMinorPerspective.minor')
  
  let minorTimeRange = null
  if (majorTimeRange && minorDuration > 0 && slotShape.roundedDifferentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.roundedDifferentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    }
  }
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (minorTimeRange) {
    adjustedEventTimeRanges[minorEventName] = minorTimeRange
  }
  
  // DUAL-TRACK: Use roundedDuration for display
  const totalTimeRange = slotShape.roundedDuration > 0
    ? createTimeRange(minorStartTime, slotShape.roundedDuration)
    : null
  
  return {
    ...appointmentSlot,
    startTime: minorStartTime,
    totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}

