/**
 * Differential Scheduling Utilities
 * 
 * LEARNING: Calculation functions for differential scheduling (major and minor arrival times)
 * WHY: Supports services where major attendee arrives earlier than minor attendee
 * PATTERN: Pure functions for calculating major and minor start times
 * Session 1.3.7: Client-Side Availability Calculations
 * 
 * NOTE: "Major" and "minor" are configurable via AvailabilitySettings.differentialPerspectives
 * Defaults to inspector (major) and client (minor) for backward compatibility
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { createTimeRange, createTimeRangesFromSlotShape, findEventFinalByName } from './booking/appointmentSlotBuilder'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { 
  getMajorEventShape, 
  getMinorEventShape 
} from '@/utils/eventAttendeeUtils'
import type { EventShapeEntity } from '@/types/entities'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

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
  
  // LEARNING: Handle edge case - if major start goes to previous day, clamp to same day at 9 AM
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
  // LEARNING: For now, minor start time is the selected slot time
  // WHY: Future property-based adjustments will be added here
  // PATTERN: Return selected slot time directly
  return selectedSlotTime
}

/**
 * WHY: Calculate property-based time adjustments (future enhancement)
LEARNING: Calculate time adjustments based on property sqft, type, etc
 */
export function calculatePropertyAdjustments(_propertyDetails?: Record<string, unknown> | null): number {
  // TODO: Session 1.3.7 - Implement property-based adjustments
  // For now, return 0 (no adjustments)
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
  
  // LEARNING: Add majorTotal minutes to major start time
  // WHY: Minor arrives after major has completed preparation
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
  appointmentSlot: import('@/types/appointment').AppointmentSlot,
  majorStartTime: string,
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): import('@/types/appointment').AppointmentSlot {
  // LEARNING: Get durations from SlotShape (source of truth)
  // WHY: SlotShape contains all duration information needed
  // PATTERN: Use attendee-based logic when available, fall back to name-based logic
  const slotShape = appointmentSlot.shape.slotShape
  
  // Find major and minor event shapes using attendee-based logic if available
  let majorEventFinal: import('@/types/appointment').EventFinal | undefined
  let minorEventFinal: import('@/types/appointment').EventFinal | undefined
  
  if (globalData && slotShape.eventFinals && availabilitySettings?.differentialPerspectives) {
    const majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    const eventShapeEntities = slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    
    const majorEventShape = majorAttendeeIds.length > 0
      ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      : null
    const minorEventShape = minorAttendeeIds.length > 0
      ? getMinorEventShape(eventShapeEntities, minorAttendeeIds)
      : null
    
    // Find event finals by event shape ID
    if (majorEventShape) {
      majorEventFinal = slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id)
    }
    if (minorEventShape) {
      minorEventFinal = slotShape.eventFinals.find(ef => ef.eventShape.id === minorEventShape.id)
    }
  }
  
  // Fallback to name-based lookup if attendee-based logic didn't find events
  if (!majorEventFinal) {
    majorEventFinal = findEventFinalByName(slotShape, 'OnSite')
  }
  if (!minorEventFinal) {
    minorEventFinal = findEventFinalByName(slotShape, 'ClientPresent')
  }
  
  const majorDuration = majorEventFinal?.duration ?? 0
  const minorDuration = minorEventFinal?.duration ?? 0
  
  // LEARNING: Calculate minor start time for minorTimeRange
  // WHY: Minor presentation happens after major has completed work
  // PATTERN: Add majorDuration to major start time
  const minorStartTime = calculateMinorStartTimeFromMajor(majorStartTime, majorDuration)
  
  // LEARNING: Create time ranges from SlotShape with new start time
  // WHY: Transform slot to use major start time as base
  // PATTERN: Use createTimeRangesFromSlotShape utility
  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)
  
  // LEARNING: Adjust minorTimeRange to end when major finishes work
  // WHY: Minor time should end when major finishes work
  // PATTERN: Use event shape names to look up time ranges (backward compatible with name-based keys)
  const majorEventName = majorEventFinal?.eventShape.name ?? 'OnSite'
  const minorEventName = minorEventFinal?.eventShape.name ?? 'ClientPresent'
  
  const majorTimeRange = timeRanges.eventTimeRanges?.[majorEventName]
  let minorTimeRange = timeRanges.eventTimeRanges?.[minorEventName]
  
  if (majorTimeRange && minorDuration > 0 && slotShape.differentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.differentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    } else {
      minorTimeRange = null
    }
  }
  
  // Update eventTimeRanges Record with adjusted minor
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
  appointmentSlot: import('@/types/appointment').AppointmentSlot,
  minorStartTime: string,
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): import('@/types/appointment').AppointmentSlot {
  // LEARNING: Get major duration from SlotShape (source of truth)
  // WHY: SlotShape already contains calculated major duration, no need for separate parameter
  // PATTERN: Use attendee-based logic when available, fall back to name-based logic
  const slotShape = appointmentSlot.shape.slotShape
  
  // Find major and minor event shapes using attendee-based logic if available
  let majorEventFinal: import('@/types/appointment').EventFinal | undefined
  let minorEventFinal: import('@/types/appointment').EventFinal | undefined
  
  if (globalData && slotShape.eventFinals && availabilitySettings?.differentialPerspectives) {
    const majorAttendeeIds = availabilitySettings.differentialPerspectives.majorAttendees || []
    const minorAttendeeIds = availabilitySettings.differentialPerspectives.minorAttendees || []
    const eventShapeEntities = slotShape.eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]
    
    const majorEventShape = majorAttendeeIds.length > 0
      ? getMajorEventShape(eventShapeEntities, majorAttendeeIds)
      : null
    const minorEventShape = minorAttendeeIds.length > 0
      ? getMinorEventShape(eventShapeEntities, minorAttendeeIds)
      : null
    
    // Find event finals by event shape ID
    if (majorEventShape) {
      majorEventFinal = slotShape.eventFinals.find(ef => ef.eventShape.id === majorEventShape.id)
    }
    if (minorEventShape) {
      minorEventFinal = slotShape.eventFinals.find(ef => ef.eventShape.id === minorEventShape.id)
    }
  }
  
  // Fallback to name-based lookup if attendee-based logic didn't find events
  if (!majorEventFinal) {
    majorEventFinal = findEventFinalByName(slotShape, 'OnSite')
  }
  if (!minorEventFinal) {
    minorEventFinal = findEventFinalByName(slotShape, 'ClientPresent')
  }
  
  const majorTotal = majorEventFinal?.duration ?? 0
  
  // LEARNING: Calculate major start time (before minor arrives)
  // WHY: Major perspective times are calculated backwards from minor start
  // PATTERN: Subtract majorTotal from minor start time
  const majorStartTime = calculateMajorStartTime(minorStartTime, majorTotal)
  
  // LEARNING: Create time ranges from SlotShape with major start time
  // WHY: Transform slot to use major start time as base for major work
  // PATTERN: Use createTimeRangesFromSlotShape utility with major start time
  const timeRanges = createTimeRangesFromSlotShape(slotShape, majorStartTime)
  
  // LEARNING: Adjust minorTimeRange to start at minor start time
  // WHY: Minor time starts when minor arrives
  // PATTERN: Use event shape names to look up time ranges (backward compatible with name-based keys)
  const majorEventName = majorEventFinal?.eventShape.name ?? 'OnSite'
  const minorEventName = minorEventFinal?.eventShape.name ?? 'ClientPresent'
  
  const majorTimeRange = timeRanges.eventTimeRanges?.[majorEventName]
  const minorDuration = minorEventFinal?.duration ?? 0
  
  let minorTimeRange = null
  if (majorTimeRange && minorDuration > 0 && slotShape.differentialOffset >= 0) {
    const minorDurationAdjusted = majorTimeRange.duration - slotShape.differentialOffset
    if (minorDurationAdjusted > 0) {
      minorTimeRange = createTimeRange(minorStartTime, minorDurationAdjusted)
    }
  }
  
  // Update eventTimeRanges Record with adjusted minor
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (minorTimeRange) {
    adjustedEventTimeRanges[minorEventName] = minorTimeRange
  }
  
  // LEARNING: Create totalTimeRange starting at minor start time
  // WHY: Total appointment time from minor perspective starts when minor arrives
  const totalTimeRange = slotShape.totalDuration > 0
    ? createTimeRange(minorStartTime, slotShape.totalDuration)
    : null
  
  return {
    ...appointmentSlot,
    startTime: minorStartTime,
    totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}

