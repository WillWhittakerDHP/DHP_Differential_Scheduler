/**
 * Differential Scheduling Utilities
 * 
 * LEARNING: Calculation functions for differential scheduling (inspector and client arrival times)
 * WHY: Supports services where inspector arrives earlier than client
 * PATTERN: Pure functions for calculating inspector and client start times
 * Session 1.3.7: Client-Side Availability Calculations
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { createTimeRange, createTimeSlot as createTimeSlotWithFlags } from './booking/appointmentSlotBuilder'
import type { TimeSlot } from '@/types/appointment'

/**
 * Calculate total time inspector is on-site before client arrives
 * LEARNING: Sums all part instances' baseTime where onSite = true
 * WHY: Inspector needs to arrive this many minutes before client start time
 * PATTERN: Filter part instances by onSite, sum baseTime values
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
  // LEARNING: Calculate durations from existing TimeSlots/TimeRanges or use 0
  // WHY: Preserves duration information even if TimeSlots/TimeRanges are null
  // PATTERN: Extract duration from TimeSlot/TimeRange or default to 0
  const totalDuration = appointmentSlot.totalTime?.duration || 0
  const totalOnSiteDuration = appointmentSlot.totalOnSite?.duration || 0
  const earlyArrivalDuration = appointmentSlot.earlyArrival?.duration || 0
  const dataCollectionDuration = appointmentSlot.dataCollection?.duration || 0
  const reportWritingDuration = appointmentSlot.reportWriting?.duration || 0
  const clientPresentationDuration = appointmentSlot.clientPresentation?.duration || 0
  
  // LEARNING: Calculate client start time for clientPresentation
  // WHY: Client presentation happens after inspector has completed on-site work
  // PATTERN: Add totalOnSiteDuration to inspector start time
  const clientStartTime = calculateClientStartTimeFromInspector(inspectorStartTime, totalOnSiteDuration)
  
  // LEARNING: Helper to get flags from existing TimeSlot or use defaults
  // WHY: Preserves flags when transforming TimeSlots
  // PATTERN: Extract flags from existing TimeSlot or use false as default
  const getTimeSlotFlags = (timeSlot: TimeSlot | null): { onSite: boolean; clientPresent: boolean; moveable: boolean } => {
    if (!timeSlot) return { onSite: false, clientPresent: false, moveable: false }
    return {
      onSite: timeSlot.onSite ?? false,
      clientPresent: timeSlot.clientPresent ?? false,
      moveable: timeSlot.moveable ?? false
    }
  }
  
  return {
    ...appointmentSlot,
    totalTime: totalDuration > 0 ? createTimeRange(inspectorStartTime, totalDuration) : null,
    totalOnSite: totalOnSiteDuration > 0 ? createTimeRange(inspectorStartTime, totalOnSiteDuration) : null,
    earlyArrival: earlyArrivalDuration > 0 
      ? createTimeSlotWithFlags(inspectorStartTime, earlyArrivalDuration, getTimeSlotFlags(appointmentSlot.earlyArrival))
      : null,
    dataCollection: dataCollectionDuration > 0
      ? createTimeSlotWithFlags(inspectorStartTime, dataCollectionDuration, getTimeSlotFlags(appointmentSlot.dataCollection))
      : null,
    reportWriting: reportWritingDuration > 0
      ? createTimeSlotWithFlags(inspectorStartTime, reportWritingDuration, getTimeSlotFlags(appointmentSlot.reportWriting))
      : null,
    clientPresentation: clientPresentationDuration > 0
      ? createTimeSlotWithFlags(clientStartTime, clientPresentationDuration, getTimeSlotFlags(appointmentSlot.clientPresentation))
      : null,
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
 * @param onSiteTotal - Total minutes inspector needs before client arrives
 * @returns AppointmentSlot with TimeSlot objects calculated from client start time
 */
export function transformToClientPerspective(
  appointmentSlot: import('@/types/appointment').AppointmentSlot,
  clientStartTime: string,
  onSiteTotal: number
): import('@/types/appointment').AppointmentSlot {
  // LEARNING: Calculate inspector start time (before client arrives)
  // WHY: Inspector perspective times are calculated backwards from client start
  // PATTERN: Subtract onSiteTotal from client start time
  const inspectorStartTime = calculateInspectorStartTime(clientStartTime, onSiteTotal)
  
  // LEARNING: Calculate durations from existing TimeSlots/TimeRanges or use 0
  // WHY: Preserves duration information even if TimeSlots/TimeRanges are null
  // PATTERN: Extract duration from TimeSlot/TimeRange or default to 0
  const totalDuration = appointmentSlot.totalTime?.duration || 0
  const totalOnSiteDuration = appointmentSlot.totalOnSite?.duration || 0
  const earlyArrivalDuration = appointmentSlot.earlyArrival?.duration || 0
  const dataCollectionDuration = appointmentSlot.dataCollection?.duration || 0
  const reportWritingDuration = appointmentSlot.reportWriting?.duration || 0
  const clientPresentationDuration = appointmentSlot.clientPresentation?.duration || 0
  
  // LEARNING: Helper to get flags from existing TimeSlot or use defaults
  // WHY: Preserves flags when transforming TimeSlots
  // PATTERN: Extract flags from existing TimeSlot or use false as default
  const getTimeSlotFlags = (timeSlot: TimeSlot | null): { onSite: boolean; clientPresent: boolean; moveable: boolean } => {
    if (!timeSlot) return { onSite: false, clientPresent: false, moveable: false }
    return {
      onSite: timeSlot.onSite ?? false,
      clientPresent: timeSlot.clientPresent ?? false,
      moveable: timeSlot.moveable ?? false
    }
  }
  
  return {
    ...appointmentSlot,
    totalTime: totalDuration > 0 ? createTimeRange(clientStartTime, totalDuration) : null,
    totalOnSite: totalOnSiteDuration > 0 ? createTimeRange(inspectorStartTime, totalOnSiteDuration) : null,
    earlyArrival: earlyArrivalDuration > 0
      ? createTimeSlotWithFlags(inspectorStartTime, earlyArrivalDuration, getTimeSlotFlags(appointmentSlot.earlyArrival))
      : null,
    dataCollection: dataCollectionDuration > 0
      ? createTimeSlotWithFlags(inspectorStartTime, dataCollectionDuration, getTimeSlotFlags(appointmentSlot.dataCollection))
      : null,
    reportWriting: reportWritingDuration > 0
      ? createTimeSlotWithFlags(inspectorStartTime, reportWritingDuration, getTimeSlotFlags(appointmentSlot.reportWriting))
      : null,
    clientPresentation: clientPresentationDuration > 0
      ? createTimeSlotWithFlags(clientStartTime, clientPresentationDuration, getTimeSlotFlags(appointmentSlot.clientPresentation))
      : null,
  }
}
