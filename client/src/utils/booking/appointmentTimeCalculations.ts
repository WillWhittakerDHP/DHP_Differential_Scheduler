/**
 * Appointment Slot Calculations
 * 
 * LEARNING: Functions to calculate AppointmentSlots from block instances
 * WHY: Groups parts by flag combinations and calculates time slots for differential scheduling
 * PATTERN: Collect parts, create finalized parts, group by flags, calculate durations and time slots
 */

import type { AppointmentSlot, AppointmentSlots, TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { createTimeRange, createTimeSlot as createTimeSlotWithFlags } from './appointmentSlotBuilder'
import {
  createFinalizedParts,
  filterZeroedParts,
  groupFinalizedPartsByFlags,
  sumFinalizedPartsDuration
} from './partShapeAggregator'

/**
 * Get flags for a group of finalized parts
 * LEARNING: Computes boolean flags from finalized parts group
 * WHY: TimeSlot objects need onSite, clientPresent, moveable, and isAvailable flags
 * PATTERN: Use OR logic - if ANY part has the flag, the group has it
 * 
 * @param parts - Array of FinalizedPart instances
 * @returns Object with boolean flags
 */
function getFlagsFromFinalizedParts(parts: Array<{ onSite: boolean; clientPresent: boolean; moveable: boolean }>): { onSite: boolean; clientPresent: boolean; moveable: boolean; isAvailable: boolean } {
  return {
    onSite: parts.some(part => part.onSite === true),
    clientPresent: parts.some(part => part.clientPresent === true),
    moveable: parts.some(part => part.moveable === true),
    isAvailable: true  // Default to available for flag-based shapes
  }
}

/**
 * Create a TimeRange from a start time and duration
 * LEARNING: Calculates endTime from startTime and duration
 * WHY: Creates TimeRange objects for AppointmentSlot totals
 * PATTERN: Add duration minutes to start time to get end time
 * 
 * @param startTime - Start time as ISO date string
 * @param duration - Duration in minutes
 * @returns TimeRange object
 */
function createTimeRangeFromStart(startTime: string, duration: number): TimeRange {
  return createTimeRange(startTime, duration)
}

/**
 * Calculate AppointmentSlots from block instances
 * LEARNING: Collects all parts, sorts by orderIndex, groups by category, calculates time slots
 * WHY: Creates normalized AppointmentSlots structure for UI rendering
 * PATTERN: Transform block instances → parts → categorized groups → AppointmentSlot objects
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options)
 * @param baseStartTime - Optional base start time (ISO date string) - if provided, calculates TimeSlot objects
 * @returns Array of AppointmentSlot objects, sorted by orderIndex
 */
export function calculateAppointmentSlots(
  blockInstances: BookingBlockInstance[],
  baseStartTime?: string | null
): AppointmentSlots {
  if (!blockInstances || blockInstances.length === 0) {
    return []
  }
  
  // LEARNING: Collect all part instances from all block instances
  // WHY: Need all parts across all selected blocks to calculate complete AppointmentSlots
  // PATTERN: Flat map block instances to part instances
  const allParts = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  if (allParts.length === 0) {
    return []
  }
  
  // LEARNING: Create finalized parts from all parts
  // WHY: Part shape is the semantic unit - all instances of same shape should be totaled
  // PATTERN: Group by part shape, create finalized parts, filter out zeroed parts
  const allFinalizedParts = createFinalizedParts(allParts)
  const nonZeroedParts = filterZeroedParts(allFinalizedParts)
  
  // LEARNING: Group finalized parts by flag combinations
  // WHY: Extensible - new part shapes automatically work without code changes
  // PATTERN: Group by boolean flag combinations instead of hardcoded categories
  const partsByFlags = groupFinalizedPartsByFlags(nonZeroedParts)
  
  // LEARNING: Calculate total time (sum of all finalized parts' baseTime)
  // WHY: Provides total appointment duration
  // PATTERN: Sum all baseTime values from non-zeroed finalized parts
  const totalDuration = sumFinalizedPartsDuration(nonZeroedParts)
  
  // LEARNING: Calculate timeOnSite (sum of finalized parts where onSite === true)
  // WHY: Provides inspector on-site duration before client arrives
  // PATTERN: Filter by onSite flag, sum durations
  const timeOnSiteDuration = sumFinalizedPartsDuration(
    nonZeroedParts.filter(p => p.onSite === true)
  )
  
  // LEARNING: Calculate flag-based group durations
  // WHY: Provides durations for each flag-based group
  // PATTERN: Calculate duration for each flag-based group
  const earlyArrivalDuration = sumFinalizedPartsDuration(partsByFlags.earlyArrival)
  const dataCollectionDuration = sumFinalizedPartsDuration(partsByFlags.dataCollection)
  const reportWritingDuration = sumFinalizedPartsDuration(partsByFlags.reportWriting)
  const clientPresentationDuration = sumFinalizedPartsDuration(partsByFlags.clientPresentation)

  // LEARNING: Create AppointmentSlot object with calculated durations
  // WHY: Provides normalized structure with orderIndex and flag-based time slots
  // PATTERN: Create AppointmentSlot with orderIndex 0 (normalized) and calculated TimeSlots if baseStartTime provided
  const appointmentSlot: AppointmentSlot = {
    buttonIndex: 0, // Required by AppointmentSlot interface
    isAvailable: true, // Default to available for appointment slots
    orderIndex: 0, // Normalized to 0 for single appointment (can be extended for multiple normalized positions)
    totalTime: baseStartTime && totalDuration > 0 
      ? createTimeRangeFromStart(baseStartTime, totalDuration) 
      : null,
    totalOnSite: baseStartTime && timeOnSiteDuration > 0
      ? createTimeRangeFromStart(baseStartTime, timeOnSiteDuration)
      : null,
    earlyArrivalSlot: baseStartTime && earlyArrivalDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          earlyArrivalDuration,
          getFlagsFromFinalizedParts(partsByFlags.earlyArrival)
        )
      : null,
    dataCollectionSlot: baseStartTime && dataCollectionDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          dataCollectionDuration,
          getFlagsFromFinalizedParts(partsByFlags.dataCollection)
        )
      : null,
    reportWritingSlot: baseStartTime && reportWritingDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          reportWritingDuration,
          getFlagsFromFinalizedParts(partsByFlags.reportWriting)
        )
      : null,
    clientPresentationSlot: baseStartTime && clientPresentationDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          clientPresentationDuration,
          getFlagsFromFinalizedParts(partsByFlags.clientPresentation)
        )
      : null,
    totalClientPresent: null, // Not calculated in this function
    totalMoveable: null // Not calculated in this function
  }
  
  return [appointmentSlot]
}

/**
 * Normalize time slots by orderIndex
 * LEARNING: Sorts AppointmentSlots by orderIndex and ensures sequential orderIndex values
 * WHY: Provides consistent UI positioning regardless of original orderIndex values
 * PATTERN: Sort by orderIndex, reassign sequential orderIndex values (0, 1, 2, ...)
 * 
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @returns Array of AppointmentSlot objects with normalized orderIndex values
 */
export function normalizeAppointmentSlotsByOrderIndex(appointmentSlots: AppointmentSlots): AppointmentSlots {
  if (!appointmentSlots || appointmentSlots.length === 0) {
    return []
  }
  
  // LEARNING: Sort by orderIndex
  // WHY: Ensures correct order before normalization
  // PATTERN: Sort ascending by orderIndex
  // FIX: Handle orderIndex from index signature - check type before arithmetic
  const sorted = [...appointmentSlots].sort((a, b) => {
    const aIndex = typeof a.orderIndex === 'number' ? a.orderIndex : 0
    const bIndex = typeof b.orderIndex === 'number' ? b.orderIndex : 0
    return aIndex - bIndex
  })
  
  // LEARNING: Reassign sequential orderIndex values
  // WHY: Normalizes orderIndex to 0, 1, 2, ... for consistent UI positioning
  // PATTERN: Map over sorted array, assign index as orderIndex
  return sorted.map((appointmentSlot, index) => ({
    ...appointmentSlot,
    orderIndex: index
  }))
}

/**
 * Calculate total duration from AppointmentSlots
 * LEARNING: Sums totalTime durations from all AppointmentSlot objects
 * WHY: Provides total appointment duration across all normalized time slots
 * PATTERN: Reduce AppointmentSlots to sum of totalTime durations
 * 
 * @param appointmentSlots - Array of AppointmentSlot objects
 * @returns Total duration in minutes
 */
export function calculateTotalDurationFromAppointmentSlots(appointmentSlots: AppointmentSlots): number {
  return appointmentSlots.reduce((sum, appointmentSlot) => {
    return sum + (appointmentSlot.totalTime?.duration || 0)
  }, 0)
}

