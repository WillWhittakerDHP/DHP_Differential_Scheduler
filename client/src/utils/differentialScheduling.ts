/**
 * Differential Scheduling Utilities
 *
 * Session 1.3.7: Client-Side Availability Calculations
 *
 * NOTE: "Major" and "minor" are configurable via AvailabilitySettings.differentialPerspectives.
 * When not configured, name-based lookup (Major/Minor) is used.
 */

import { createLogger } from '@/utils/logger'
import { createTimeRange, createTimeRangesFromSlotShape } from './booking/appointmentSlotBuilder'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { EventFinal, AppointmentSlot } from '@/types/appointment'

const logger = createLogger('differentialScheduling')

function durationMinutes(eventFinal: EventFinal | undefined, context: string): number {
  if (eventFinal === undefined) {
    logger.debug(`${context}: no event final, duration 0`)
    return 0
  }
  const d = eventFinal.roundedDuration
  return d !== undefined && d !== null ? d : 0
}

type SlotShapeWithFinals = AppointmentSlot['shape']['slotShape']

/** Resolve major and minor EventFinal from slotShape via differentialRole. */
function resolveMajorMinorEventFinals(
  slotShape: SlotShapeWithFinals,
  context: string
): {
  majorEventFinal: EventFinal | undefined
  minorEventFinal: EventFinal | undefined
} {
  if (!slotShape.eventFinals?.length) {
    return { majorEventFinal: undefined, minorEventFinal: undefined }
  }

  const eventShapeEntities = slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const majorEventShape = getEventShapeByRole(eventShapeEntities, 'major')
  if (!majorEventShape) {
    logger.error(`${context}: no event shape with differentialRole=major`, {
      availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
    })
  }

  const minorEventShape = getEventShapeByRole(eventShapeEntities, 'minor')
  if (!minorEventShape) {
    logger.error(`${context}: no event shape with differentialRole=minor`, {
      availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
    })
  }

  const majorEventFinal = majorEventShape
    ? slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id)
    : undefined
  const minorEventFinal = minorEventShape
    ? slotShape.eventFinals.find(ef => ef.eventShape.id === minorEventShape.id)
    : undefined

  return { majorEventFinal, minorEventFinal }
}

/**
 * Calculate major start time from minor start time
 * 
 * @param minorStartTime - Minor start time as ISO date string
 * @param majorTotal - Total minutes major needs before minor arrives
 * @returns Major start time as ISO date string
 */
function calculateMajorStartTime(minorStartTime: string, majorTotal: number): string {
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
 * Calculate minor start time from major start time
 * 
 * @param majorStartTime - Major start time as ISO date string
 * @param majorTotal - Total minutes major needs before minor arrives
 * @returns Minor start time as ISO date string
 */
function calculateMinorStartTimeFromMajor(majorStartTime: string, majorTotal: number): string {
  const majorStart = new Date(majorStartTime)
  const minorStart = new Date(majorStart)
  
  // PATTERN: Use setUTCMinutes to add time in UTC
  minorStart.setUTCMinutes(minorStart.getUTCMinutes() + majorTotal)
  
  return minorStart.toISOString()
}

/**
 * PATTERN: Transform AppointmentSlot to major perspective
PATTERN: Use major start ...
 */
export function transformToMajorPerspective(
  appointmentSlot: AppointmentSlot,
  majorStartTime: string,
): AppointmentSlot {
  const slotShape = appointmentSlot.shape.slotShape
  const { majorEventFinal, minorEventFinal } = resolveMajorMinorEventFinals(
    slotShape,
    'transformToMajorPerspective'
  )

  const majorDuration = durationMinutes(majorEventFinal, 'transformToMajorPerspective.major')
  const minorDuration = durationMinutes(minorEventFinal, 'transformToMajorPerspective.minor')

  const minorStartTime = calculateMinorStartTimeFromMajor(majorStartTime, majorDuration)

  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)

  const majorEventName = majorEventFinal?.eventShape?.name
  const minorEventName = minorEventFinal?.eventShape?.name
  
  const majorTimeRange = majorEventName ? timeRanges.eventTimeRanges?.[majorEventName] : null
  let minorTimeRange = minorEventName ? timeRanges.eventTimeRanges?.[minorEventName] : null
  
  if (majorTimeRange && minorDuration > 0 && slotShape.roundedDifferentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.roundedDifferentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    } else {
      minorTimeRange = null
    }
  }
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (minorTimeRange && minorEventName) {
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
 * 
 * @param appointmentSlot - AppointmentSlot object (may have null TimeSlots)
 * @param minorStartTime - Minor start time as ISO date string
 * @returns AppointmentSlot with TimeSlot objects calculated from minor start time
 */
export function transformToMinorPerspective(
  appointmentSlot: AppointmentSlot,
  minorStartTime: string,
): AppointmentSlot {
  const slotShape = appointmentSlot.shape.slotShape
  const { majorEventFinal, minorEventFinal } = resolveMajorMinorEventFinals(
    slotShape,
    'transformToMinorPerspective'
  )

  const majorTotal = durationMinutes(majorEventFinal, 'transformToMinorPerspective.major')

  const majorStartTime = calculateMajorStartTime(minorStartTime, majorTotal)

  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)

  const majorEventName = majorEventFinal?.eventShape?.name
  const minorEventName = minorEventFinal?.eventShape?.name

  const majorTimeRange = majorEventName ? timeRanges.eventTimeRanges?.[majorEventName] : null
  const minorDuration = durationMinutes(minorEventFinal, 'transformToMinorPerspective.minor')
  
  let minorTimeRange = null
  if (majorTimeRange && minorDuration > 0 && slotShape.roundedDifferentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.roundedDifferentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    }
  }
  
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (minorTimeRange && minorEventName) {
    adjustedEventTimeRanges[minorEventName] = minorTimeRange
  }
  
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

