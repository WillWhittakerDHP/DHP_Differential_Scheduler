/**
 * Differential Scheduling Utilities
 * 
 * LEARNING: Calculation functions for differential scheduling (inspector and client arrival times)
 * WHY: Supports services where inspector arrives earlier than client
 * PATTERN: Pure functions for calculating inspector and client start times
 * Session 1.3.7: Client-Side Availability Calculations
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { createTimeRange, createTimeRangesFromSlotShape } from './booking/appointmentSlotBuilder'

/**
 * Calculate total time inspector is on-site before client arrives
 * LEARNING: Sums all part instances' baseTime where onSite = true
 * WHY: Inspector needs to arrive this many minutes before client start time
 * PATTERN: Filter part instances by onSite, sum baseTime values
 * 
 * @deprecated Use `findEventFinalByName(AppointmentShape.slotShape, "OnSite")?.duration` instead. This function filters raw parts, which is redundant when SlotShape already contains the calculated value.
 * 
 * @param service - BookingBlockInstance with partInstances
 * @returns Total on-site time in minutes, defaults to 0 if no part instances
 */
export function calculateOnSiteTotal(service: BookingBlockInstance | null): number {
  if (!service?.partInstances || service.partInstances.length === 0) return 0
  
  // LEARNING: Filter part instances where onSite = true
  // WHY: Only count parts that require inspector presence before client arrives
  // PATTERN: Filter and reduce to sum baseTime values
  const onSiteParts = service.partInstances.filter(pi => pi.onSite === true)
  const onSiteSum = onSiteParts.reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
  
  // LEARNING: Return onSiteSum if > 0, otherwise sum all baseTime as fallback
  // WHY: If no parts marked onSite, assume all parts require inspector presence
  // PATTERN: Conditional return with fallback
  if (onSiteSum > 0) {
    return onSiteSum
  }
  
  // Fallback: sum all baseTime values
  return service.partInstances.reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
}

/**
 * Calculate total time client is present
 * LEARNING: Sums all part instances' baseTime where clientPresent = true
 * WHY: Duration of time client needs to be present
 * PATTERN: Filter part instances by clientPresent, sum baseTime values
 * 
 * @deprecated Use `findEventFinalByName(AppointmentShape.slotShape, "ClientPresent")?.duration` instead. This function filters raw parts, which is redundant when SlotShape already contains the calculated value.
 * 
 * @param service - BookingBlockInstance with partInstances
 * @returns Total client presence time in minutes, defaults to 0 if no part instances
 */
export function calculateClientPresenceDuration(service: BookingBlockInstance | null): number {
  if (!service?.partInstances || service.partInstances.length === 0) return 0
  
  // LEARNING: Filter part instances where clientPresent = true
  // WHY: Only count parts that require client presence
  // PATTERN: Filter and reduce to sum baseTime values
  return service.partInstances
    .filter(pi => pi.clientPresent === true)
    .reduce((sum, pi) => sum + (pi.baseTime || 0), 0)
}

/**
 * Calculate inspector start time from client start time
 * LEARNING: Inspector arrives earlier: inspectorStart = clientStart - onSiteTotal
 * WHY: Inspector needs time to prepare before client arrives
 * PATTERN: Subtract onSiteTotal minutes from client start time
 * 
 * @param clientStartTime - Client start time as ISO date string
 * @param onSiteTotal - Total minutes inspector needs before client arrives
 * @returns Inspector start time as ISO date string
 */
export function calculateInspectorStartTime(clientStartTime: string, onSiteTotal: number): string {
  const clientStart = new Date(clientStartTime)
  const inspectorStart = new Date(clientStart)
  
  // LEARNING: Subtract onSiteTotal minutes from client start time using UTC
  // WHY: Inspector arrives earlier to prepare; use UTC to match ISO string format
  // PATTERN: Use setUTCMinutes to subtract time in UTC
  inspectorStart.setUTCMinutes(inspectorStart.getUTCMinutes() - onSiteTotal)
  
  // LEARNING: Handle edge case - if inspector start goes to previous day, clamp to same day at 9 AM
  // WHY: Prevent midnight rollover issues - inspector should arrive on same day as client
  // PATTERN: Check if UTC date changed, reset to 9:00 AM UTC on same day if needed
  if (inspectorStart.getUTCDate() !== clientStart.getUTCDate()) {
    inspectorStart.setUTCDate(clientStart.getUTCDate())
    inspectorStart.setUTCHours(9, 0, 0, 0) // Clamp to 9:00 AM UTC on same day
  }
  
  return inspectorStart.toISOString()
}

/**
 * Calculate client start time (for non-differential services, same as selected slot)
 * LEARNING: For differential services, client arrives at selected slot time
 * WHY: Client start time is the selected time slot
 * PATTERN: Return selected slot time directly
 * 
 * @param selectedSlotTime - Selected time slot as ISO date string
 * @returns Client start time as ISO date string (same as selected slot for now)
 */
export function calculateClientStartTime(selectedSlotTime: string): string {
  // LEARNING: For now, client start time is the selected slot time
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
 * Calculate client start time from inspector start time
 * LEARNING: Client arrives later: clientStart = inspectorStart + onSiteTotal
 * WHY: For differential scheduling, client arrives after inspector has prepared
 * PATTERN: Add onSiteTotal minutes to inspector start time
 * 
 * @param inspectorStartTime - Inspector start time as ISO date string
 * @param onSiteTotal - Total minutes inspector needs before client arrives
 * @returns Client start time as ISO date string
 */
export function calculateClientStartTimeFromInspector(inspectorStartTime: string, onSiteTotal: number): string {
  const inspectorStart = new Date(inspectorStartTime)
  const clientStart = new Date(inspectorStart)
  
  // LEARNING: Add onSiteTotal minutes to inspector start time
  // WHY: Client arrives after inspector has completed on-site preparation
  // PATTERN: Use setUTCMinutes to add time in UTC
  clientStart.setUTCMinutes(clientStart.getUTCMinutes() + onSiteTotal)
  
  return clientStart.toISOString()
}

/**
 * Transform AppointmentSlot to inspector perspective
 * LEARNING: Creates AppointmentSlot with time slots calculated from inspector start time
 * WHY: Provides inspector perspective time slots for UI display
 * PATTERN: Use inspector start time as base, calculate all category time slots from that base
 * 
 * @param appointmentSlot - AppointmentSlot object (may have null TimeSlots)
 * @param inspectorStartTime - Inspector start time as ISO date string
 * @returns AppointmentSlot with TimeSlot objects calculated from inspector start time
 */
export function transformToInspectorPerspective(
  appointmentSlot: import('@/types/appointment').AppointmentSlot,
  inspectorStartTime: string
): import('@/types/appointment').AppointmentSlot {
  // LEARNING: Get durations from SlotShape (source of truth)
  // WHY: SlotShape contains all duration information needed
  // PATTERN: Use helper functions to find events by name
  // Session Event Refactor: Use eventFinals array with helper functions instead of hardcoded Record access
  const slotShape = appointmentSlot.shape.slotShape
  const onSiteEventFinal = findEventFinalByName(slotShape, 'OnSite')
  const clientPresentEventFinal = findEventFinalByName(slotShape, 'ClientPresent')
  const totalOnSiteDuration = onSiteEventFinal?.duration ?? 0
  const clientPresentDuration = clientPresentEventFinal?.duration ?? 0
  
  // LEARNING: Calculate client start time for clientPresentTimeRange
  // WHY: Client presentation happens after inspector has completed on-site work
  // PATTERN: Add totalOnSiteDuration to inspector start time
  const clientStartTime = calculateClientStartTimeFromInspector(inspectorStartTime, totalOnSiteDuration)
  
  // LEARNING: Create time ranges from SlotShape with new start time
  // WHY: Transform slot to use inspector start time as base
  // PATTERN: Use createTimeRangesFromSlotShape utility
  const timeRanges = createTimeRangesFromSlotShape(slotShape, inspectorStartTime)
  
  // LEARNING: Adjust clientPresentTimeRange to end when inspector finishes on-site work
  // WHY: Client-present time should end when inspector finishes on-site work
  // Session Event Refactor: Use eventTimeRanges Record
  const onSiteTimeRange = timeRanges.eventTimeRanges?.['OnSite']
  let clientPresentTimeRange = timeRanges.eventTimeRanges?.['ClientPresent']
  
  if (onSiteTimeRange && clientPresentDuration > 0 && slotShape.clientStartOffset >= 0) {
    const clientPresentDurationAdjusted = onSiteTimeRange.duration - slotShape.clientStartOffset
    if (clientPresentDurationAdjusted > 0) {
      clientPresentTimeRange = createTimeRange(clientStartTime, clientPresentDurationAdjusted)
    } else {
      clientPresentTimeRange = null
    }
  }
  
  // Update eventTimeRanges Record with adjusted ClientPresent
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (clientPresentTimeRange) {
    adjustedEventTimeRanges['ClientPresent'] = clientPresentTimeRange
  }
  
  return {
    ...appointmentSlot,
    startTime: inspectorStartTime,
    totalTimeRange: timeRanges.totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}

/**
 * Transform AppointmentSlot to client perspective
 * LEARNING: Creates AppointmentSlot with time slots calculated from client start time
 * WHY: Provides client perspective time slots for UI display
 * PATTERN: Use client start time as base, calculate inspector times backwards from that base
 * 
 * @param appointmentSlot - AppointmentSlot object (may have null TimeSlots)
 * @param clientStartTime - Client start time as ISO date string
 * @returns AppointmentSlot with TimeSlot objects calculated from client start time
 */
export function transformToClientPerspective(
  appointmentSlot: import('@/types/appointment').AppointmentSlot,
  clientStartTime: string
): import('@/types/appointment').AppointmentSlot {
  // LEARNING: Get onSite duration from SlotShape (source of truth)
  // WHY: SlotShape already contains calculated onSite duration, no need for separate parameter
  // PATTERN: Use helper function to find OnSite event
  // Session Event Refactor: Use eventFinals array with helper function instead of hardcoded Record access
  const slotShape = appointmentSlot.shape.slotShape
  const onSiteEventFinal = findEventFinalByName(slotShape, 'OnSite')
  const onSiteTotal = onSiteEventFinal?.duration ?? 0
  
  // LEARNING: Calculate inspector start time (before client arrives)
  // WHY: Inspector perspective times are calculated backwards from client start
  // PATTERN: Subtract onSiteTotal from client start time
  const inspectorStartTime = calculateInspectorStartTime(clientStartTime, onSiteTotal)
  
  // LEARNING: Create time ranges from SlotShape with inspector start time
  // WHY: Transform slot to use inspector start time as base for on-site work
  // PATTERN: Use createTimeRangesFromSlotShape utility with inspector start time
  const timeRanges = createTimeRangesFromSlotShape(slotShape, inspectorStartTime)
  
  // LEARNING: Adjust clientPresentTimeRange to start at client start time
  // WHY: Client-present time starts when client arrives
  // PATTERN: Create clientPresentTimeRange starting at clientStartTime, ending when inspector finishes on-site work
  // Session Event Refactor: Use eventTimeRanges Record and helper function for duration
  const onSiteTimeRange = timeRanges.eventTimeRanges?.['OnSite']
  const clientPresentEventFinal = findEventFinalByName(slotShape, 'ClientPresent')
  const clientPresentDuration = clientPresentEventFinal?.duration ?? 0
  
  let clientPresentTimeRange = null
  if (onSiteTimeRange && clientPresentDuration > 0 && slotShape.clientStartOffset >= 0) {
    const clientPresentDurationAdjusted = onSiteTimeRange.duration - slotShape.clientStartOffset
    if (clientPresentDurationAdjusted > 0) {
      clientPresentTimeRange = createTimeRange(clientStartTime, clientPresentDurationAdjusted)
    }
  }
  
  // Update eventTimeRanges Record with adjusted ClientPresent
  const adjustedEventTimeRanges = { ...timeRanges.eventTimeRanges }
  if (clientPresentTimeRange) {
    adjustedEventTimeRanges['ClientPresent'] = clientPresentTimeRange
  }
  
  // LEARNING: Create totalTimeRange starting at client start time
  // WHY: Total appointment time from client perspective starts when client arrives
  const totalTimeRange = slotShape.totalDuration > 0
    ? createTimeRange(clientStartTime, slotShape.totalDuration)
    : null
  
  return {
    ...appointmentSlot,
    startTime: clientStartTime,
    totalTimeRange,
    eventTimeRanges: adjustedEventTimeRanges
  }
}
