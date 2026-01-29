/**
 * Appointment Slot Builder
 * 
 * LEARNING: Pure utility functions for building AppointmentShape and AppointmentSlot
 * WHY: Separates time-independent structure (shape) from time-applied data (slot)
 * PATTERN: Pure functions, no side effects, no reactivity
 */

import type { 
  TimeRange, 
  TimeSlot, 
  FlagBasedShape, 
  AppointmentShape, 
  AppointmentSlot 
} from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { roundDuration } from '@/utils/booking/durationRounding'
import {
  createFinalizedParts,
  filterZeroedParts,
  groupFinalizedPartsByFlags,
  sumFinalizedPartsDuration
} from './partShapeAggregator'
import type { FinalizedPart } from './FinalizedPart'

/**
 * Create a TimeRange from start time and duration
 * LEARNING: toISOString() always produces valid RFC3339 format (UTC with Z suffix)
 * WHY: Date.toISOString() is guaranteed to return RFC3339-compliant string
 * PATTERN: Use type assertion since we know the format is correct
 */
export function createTimeRange(startTime: string, duration: number): TimeRange {
  const start = new Date(startTime)
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + duration)
  
  const result = {
    startTime: start.toISOString() as RFC3339DateTime,
    endTime: end.toISOString() as RFC3339DateTime,
    duration
  }
  
  return result
}

/**
 * Create a TimeSlot from start time, duration, and flags
 */
export function createTimeSlot(
  startTime: string,
  duration: number,
  flags: { onSite: boolean; clientPresent: boolean; moveable: boolean; isAvailable: boolean }
): TimeSlot {
  const range = createTimeRange(startTime, duration)
  
  return {
    ...range,
    onSite: flags.onSite,
    clientPresent: flags.clientPresent,
    moveable: flags.moveable,
    isAvailable: flags.isAvailable
  }
}

/**
 * Build a FlagBasedShape from finalized parts
 * LEARNING: Creates shape with duration and flags from a group of finalized parts
 * WHY: Provides structure for flag-based groups (replaces CategoryShape)
 * PATTERN: Sum durations, use OR logic for boolean flags
 * 
 * @param parts - Array of FinalizedPart instances
 * @returns FlagBasedShape with totaled duration and computed flags, or null if empty
 */
function buildFlagBasedShape(parts: FinalizedPart[]): FlagBasedShape | null {
  if (parts.length === 0) return null
  
  return {
    duration: sumFinalizedPartsDuration(parts),
    onSite: parts.some(part => part.onSite === true),
    clientPresent: parts.some(part => part.clientPresent === true),
    moveable: parts.some(part => part.moveable === true)
  }
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations, flags, and offsets (no times).
 * This is calculated once and reused for each available start time.
 * 
 * @param blockInstances - Array of block instances to build shape from
 * @param settings - Optional availability settings for rounding configuration
 */
export function buildAppointmentShape(
  blockInstances: BookingBlockInstance[],
  settings?: AvailabilitySettings | null
): AppointmentShape {
  if (!blockInstances || blockInstances.length === 0) {
    return {
      clientPresentationShape: null,
      dataCollectionShape: null,
      earlyArrivalShape: null,
      reportWritingShape: null,
      totalOnSiteDuration: 0,
      totalClientPresentDuration: 0,
      totalMoveableDuration: 0,
      totalDuration: 0,
      clientStartOffset: 0
    }
  }
  
  // Collect all parts from block instances
  // LEARNING: Use flatMap to collect all parts from all block instances
  // WHY: Provides flat array of all parts for aggregation
  // PATTERN: Functional approach - flatMap instead of forEach with push mutations
  const allParts = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  if (allParts.length === 0) {
    return {
      clientPresentationShape: null,
      dataCollectionShape: null,
      earlyArrivalShape: null,
      reportWritingShape: null,
      totalOnSiteDuration: 0,
      totalClientPresentDuration: 0,
      totalMoveableDuration: 0,
      totalDuration: 0,
      clientStartOffset: 0
    }
  }
  
  // LEARNING: Group parts by part shape and create finalized parts
  // WHY: Part shape is the semantic unit - all instances of same shape should be totaled
  // PATTERN: Create finalized parts, then filter out zeroed parts
  const allFinalizedParts = createFinalizedParts(allParts)
  const nonZeroedParts = filterZeroedParts(allFinalizedParts)
  
  // LEARNING: Group finalized parts by flag combinations
  // WHY: Extensible - new part shapes automatically work without code changes
  // PATTERN: Group by boolean flag combinations instead of hardcoded categories
  const partsByFlags = groupFinalizedPartsByFlags(nonZeroedParts)
  
  // Calculate flag-based shapes
  const clientPresentationShape = buildFlagBasedShape(partsByFlags.clientPresentation)
  const dataCollectionShape = buildFlagBasedShape(partsByFlags.dataCollection)
  const earlyArrivalShape = buildFlagBasedShape(partsByFlags.earlyArrival)
  const reportWritingShape = buildFlagBasedShape(partsByFlags.reportWriting)
  
  // Calculate total durations from non-zeroed finalized parts
  // LEARNING: Sum durations based on boolean flags
  // WHY: Provides totals for each flag-based group
  // PATTERN: Filter finalized parts by flag, then sum durations
  const totalOnSiteDuration = sumFinalizedPartsDuration(
    nonZeroedParts.filter(p => p.onSite === true)
  )
  const totalClientPresentDuration = sumFinalizedPartsDuration(
    nonZeroedParts.filter(p => p.clientPresent === true)
  )
  const totalMoveableDuration = sumFinalizedPartsDuration(
    nonZeroedParts.filter(p => p.moveable === true)
  )
  const totalDuration = sumFinalizedPartsDuration(nonZeroedParts)
  
  // LEARNING: Round on-site duration based on availability settings
  // WHY: Ensures end times align with configured time increments when rounding is enabled
  // PATTERN: Use configurable rounding function that respects settings
  const roundedOnSiteDuration = roundDuration(totalOnSiteDuration, settings || null)
  
  // Calculate clientStartOffset: duration of parts where onSite=true AND clientPresent=false
  // LEARNING: Exclude zeroed parts from clientStartOffset calculation
  // WHY: Zeroed parts should not contribute to timing offsets
  // PATTERN: Filter finalized parts by flag combination, then sum durations
  const clientStartOffset = sumFinalizedPartsDuration(
    nonZeroedParts.filter(p => p.onSite === true && p.clientPresent === false)
  )
  
  const shape: AppointmentShape = {
    clientPresentationShape,
    dataCollectionShape,
    earlyArrivalShape,
    reportWritingShape,
    totalOnSiteDuration: roundedOnSiteDuration, // Use rounded duration
    totalClientPresentDuration,
    totalMoveableDuration,
    totalDuration,
    clientStartOffset
  }
  
  return shape
}

/**
 * Apply AppointmentShape to a specific start time
 * 
 * Creates AppointmentSlot with actual TimeRanges.
 * Validates that all totals end at the same time.
 * 
 * @param shape - AppointmentShape with durations
 * @param startTime - Start time (ISO string)
 * @param buttonIndex - UI button index
 * @param fallbackDuration - Optional duration to use if shape.totalDuration is 0
 * @throws Error if totals don't align (endTime mismatch)
 */
export function applyShapeToTime(
  shape: AppointmentShape,
  startTime: string,
  buttonIndex: number,
  fallbackDuration?: number,
  isAvailable: boolean = true
): AppointmentSlot {
  // Apply each flag-based shape to startTime
  // LEARNING: Creates TimeSlot from FlagBasedShape
  // WHY: Converts time-independent shape to time-specific slot
  // PATTERN: Check if shape exists and has duration, then create TimeSlot
  const applyFlagBasedShape = (flagShape: FlagBasedShape | null): TimeSlot | null => {
    if (!flagShape || flagShape.duration === 0) return null
    
    return createTimeSlot(startTime, flagShape.duration, {
      onSite: flagShape.onSite,
      clientPresent: flagShape.clientPresent,
      moveable: flagShape.moveable,
      isAvailable: true  // Default to available for flag-based shapes
    })
  }
  
  // Calculate totals
  // LEARNING: Always create totalTime, using fallbackDuration if shape.totalDuration is 0
  // WHY: Ensures buttons always have a display time with valid duration, even when no services are selected
  const effectiveTotalDuration = shape.totalDuration > 0 ? shape.totalDuration : (fallbackDuration || 0)
  const totalTime = createTimeRange(startTime, effectiveTotalDuration)
  
  const totalOnSite = shape.totalOnSiteDuration > 0
    ? createTimeRange(startTime, shape.totalOnSiteDuration)
    : null
  
  const clientStartTime = new Date(startTime)
  clientStartTime.setUTCMinutes(clientStartTime.getUTCMinutes() + shape.clientStartOffset)
  
  // LEARNING: For differential services, totalClientPresent should end when inspector finishes on-site work
  // WHY: Client perspective should show time from client arrival to when inspector finishes on-site work
  // PATTERN: Calculate duration so that totalClientPresent ends at totalOnSite.endTime
  // NOTE: This ensures both perspectives end at the same time (when inspector finishes on-site work)
  let totalClientPresent: TimeRange | null = null
  if (totalOnSite && shape.clientStartOffset >= 0) {
    // Client-present time should end when inspector finishes on-site work
    const clientPresentDuration = totalOnSite.duration - shape.clientStartOffset
    if (clientPresentDuration > 0) {
      totalClientPresent = createTimeRange(clientStartTime.toISOString(), clientPresentDuration)
    }
  } else if (shape.totalClientPresentDuration > 0) {
    // Fallback: use shape duration if totalOnSite is null
    totalClientPresent = createTimeRange(clientStartTime.toISOString(), shape.totalClientPresentDuration)
  }
  
  const totalMoveable = shape.totalMoveableDuration > 0
    ? createTimeRange(startTime, shape.totalMoveableDuration)
    : null
  
  // Validate: totalClientPresent and totalOnSite must end at the same time
  // LEARNING: For differential services, both perspectives should end when inspector finishes on-site work
  // WHY: Client-present time ends when inspector finishes on-site work, not when total appointment ends
  // PATTERN: Validate that client-present and on-site times align
  if (totalClientPresent && totalOnSite) {
    if (totalClientPresent.endTime !== totalOnSite.endTime) {
      throw new Error(
        `AppointmentSlot validation failed: ` +
        `totalClientPresent.endTime (${totalClientPresent.endTime}) !== ` +
        `totalOnSite.endTime (${totalOnSite.endTime})`
      )
    }
  }
  
  return {
    buttonIndex,
    isAvailable,
    clientPresentationSlot: applyFlagBasedShape(shape.clientPresentationShape),
    dataCollectionSlot: applyFlagBasedShape(shape.dataCollectionShape),
    earlyArrivalSlot: applyFlagBasedShape(shape.earlyArrivalShape),
    reportWritingSlot: applyFlagBasedShape(shape.reportWritingShape),
    totalOnSite,
    totalClientPresent,
    totalMoveable,
    totalTime
  }
}

/**
 * Derive the TimeRange for a given perspective
 * 
 * @param slot - AppointmentSlot with precomputed totals
 * @param perspective - Which perspective to derive
 * @returns TimeRange for display, or null if not applicable
 * 
 * LEARNING: Falls back to totalTime if perspective-specific total is null
 * WHY: Ensures buttons always have a display time, even when specific perspective totals are null
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'onSite' | 'clientPresent' | 'nonDifferential'
): TimeRange | null {
  let result: TimeRange | null = null
  
  switch (perspective) {
    case 'onSite':
      // LEARNING: Fallback to totalTime if totalOnSite is null
      // WHY: Ensures buttons always have a display time
      result = slot.totalOnSite ?? slot.totalTime
      break
    case 'clientPresent':
      // LEARNING: Fallback to totalTime if totalClientPresent is null
      // WHY: Ensures buttons always have a display time
      result = slot.totalClientPresent ?? slot.totalTime
      break
    case 'nonDifferential':
      // LEARNING: Show on-site time for non-differential (same as inspector view)
      // WHY: Non-differential services should show inspector times on buttons, not total appointment time
      // PATTERN: Use totalOnSite with fallback to totalTime if null
      result = slot.totalOnSite ?? slot.totalTime
      break
    default:
      result = null
  }
  
  return result
}
