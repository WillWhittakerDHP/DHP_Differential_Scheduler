/**
 * Appointment Slot Builder
 * 
 * LEARNING: Pure utility functions for building AppointmentShape and AppointmentSlot
 * WHY: Separates time-independent structure (shape) from time-applied data (slot)
 * PATTERN: Pure functions, no side effects, no reactivity
 */

import type { 
  TimeRange, 
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
  calculateSlotShape
} from './partShapeAggregator'

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
 * Add minutes to a start time
 * LEARNING: Helper to add minutes to an ISO string
 * WHY: Used for calculating client start time with offset
 * PATTERN: Create Date, add minutes, return ISO string
 */
function addMinutes(startTime: string, minutes: number): string {
  const date = new Date(startTime)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}

/**
 * Convert SlotShape + startTime to TimeRange objects
 * LEARNING: Precomputes TimeRanges for performance (accessed frequently in UI)
 * WHY: TimeRanges are accessed frequently (graphBars, derivePerspective, TimeSlotGrid), so precompute
 * PATTERN: Pure function that creates TimeRange objects from durations
 * 
 * @param slotShape - SlotShape with durations
 * @param startTime - Base start time (ISO string)
 * @returns Object with precomputed TimeRanges
 */
export function createTimeRangesFromSlotShape(
  slotShape: import('@/types/appointment').SlotShape,
  startTime: string
): {
  totalTimeRange: TimeRange | null
  onSiteTimeRange: TimeRange | null
  clientPresentTimeRange: TimeRange | null
  moveableTimeRange: TimeRange | null
} {
  return {
    totalTimeRange: slotShape.totalDuration > 0
      ? createTimeRange(startTime, slotShape.totalDuration)
      : null,
    onSiteTimeRange: slotShape.onSite > 0
      ? createTimeRange(startTime, slotShape.onSite)
      : null,
    clientPresentTimeRange: slotShape.clientPresent > 0
      ? createTimeRange(
          addMinutes(startTime, slotShape.clientStartOffset),
          slotShape.clientPresent
        )
      : null,
    moveableTimeRange: slotShape.moveable > 0
      ? createTimeRange(startTime, slotShape.moveable)
      : null
  }
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations and stores finalized parts (no times).
 * This is calculated once and reused for each available start time.
 * 
 * @param blockInstances - Array of block instances to build shape from
 * @param settings - Optional availability settings for rounding configuration
 */
export function buildAppointmentShape(
  blockInstances: BookingBlockInstance[],
  settings?: AvailabilitySettings | null
): AppointmentShape {
  // Collect all parts from block instances
  // LEARNING: Use flatMap to collect all parts from all block instances
  // WHY: Provides flat array of all parts for aggregation
  // PATTERN: Functional approach - flatMap instead of forEach with push mutations
  const allParts = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  // LEARNING: Group parts by part shape and create finalized parts
  // WHY: Part shape is the semantic unit - all instances of same shape should be totaled
  // PATTERN: Create finalized parts, then filter out zeroed parts
  const allFinalizedParts = createFinalizedParts(allParts)
  const nonZeroedParts = filterZeroedParts(allFinalizedParts)
  
  // Calculate SlotShape from non-zeroed finalized parts
  // LEARNING: Single-pass calculation for efficiency
  // WHY: More efficient than multiple filter+reduce operations
  // PATTERN: Use calculateSlotShape to get all durations in one pass
  let slotShape = calculateSlotShape(nonZeroedParts)
  
  // LEARNING: Round on-site duration based on availability settings
  // WHY: Ensures end times align with configured time increments when rounding is enabled
  // PATTERN: Use configurable rounding function that respects settings
  slotShape = {
    ...slotShape,
    onSite: roundDuration(slotShape.onSite, settings || null)
  }
  
  const shape: AppointmentShape = {
    finalizedParts: nonZeroedParts,
    slotShape
  }
  
  return shape
}

/**
 * Apply AppointmentShape to a specific start time
 * 
 * Creates AppointmentSlot with actual TimeRanges.
 * Validates that all totals end at the same time.
 * 
 * @param shape - AppointmentShape with finalized parts and SlotShape
 * @param startTime - Start time (ISO string)
 * @param buttonIndex - UI button index
 * @param fallbackDuration - Optional duration to use if shape.slotShape.totalDuration is 0
 * @param isAvailable - Whether this slot is available
 * @returns AppointmentSlot with precomputed TimeRanges
 */
export function applyShapeToTime(
  shape: AppointmentShape,
  startTime: string,
  buttonIndex: number,
  fallbackDuration?: number,
  isAvailable: boolean = true
): AppointmentSlot {
  // Use fallback duration if shape has no duration
  // LEARNING: Always create totalTimeRange, using fallbackDuration if shape.slotShape.totalDuration is 0
  // WHY: Ensures buttons always have a display time with valid duration, even when no services are selected
  const effectiveSlotShape = shape.slotShape.totalDuration > 0
    ? shape.slotShape
    : {
        ...shape.slotShape,
        totalDuration: fallbackDuration || 0
      }
  
  // Create all time ranges from SlotShape
  // LEARNING: Precompute TimeRanges for performance
  // WHY: TimeRanges are accessed frequently in UI, so precompute them
  // PATTERN: Use utility function to create all TimeRanges at once
  const timeRanges = createTimeRangesFromSlotShape(effectiveSlotShape, startTime)
  
  // LEARNING: For differential services, clientPresentTimeRange should end when inspector finishes on-site work
  // WHY: Client perspective should show time from client arrival to when inspector finishes on-site work
  // PATTERN: Adjust clientPresentTimeRange to end at onSiteTimeRange.endTime if both exist
  let clientPresentTimeRange = timeRanges.clientPresentTimeRange
  if (timeRanges.onSiteTimeRange && timeRanges.clientPresentTimeRange && effectiveSlotShape.clientStartOffset >= 0) {
    // Client-present time should end when inspector finishes on-site work
    const clientPresentDuration = timeRanges.onSiteTimeRange.duration - effectiveSlotShape.clientStartOffset
    if (clientPresentDuration > 0) {
      clientPresentTimeRange = createTimeRange(
        addMinutes(startTime, effectiveSlotShape.clientStartOffset),
        clientPresentDuration
      )
    } else {
      clientPresentTimeRange = null
    }
  }
  
  // Validate: clientPresentTimeRange and onSiteTimeRange must end at the same time
  // LEARNING: For differential services, both perspectives should end when inspector finishes on-site work
  // WHY: Client-present time ends when inspector finishes on-site work, not when total appointment ends
  // PATTERN: Validate that client-present and on-site times align
  if (clientPresentTimeRange && timeRanges.onSiteTimeRange) {
    if (clientPresentTimeRange.endTime !== timeRanges.onSiteTimeRange.endTime) {
      throw new Error(
        `AppointmentSlot validation failed: ` +
        `clientPresentTimeRange.endTime (${clientPresentTimeRange.endTime}) !== ` +
        `onSiteTimeRange.endTime (${timeRanges.onSiteTimeRange.endTime})`
      )
    }
  }
  
  return {
    buttonIndex,
    isAvailable,
    shape,
    startTime,
    totalTimeRange: timeRanges.totalTimeRange,
    onSiteTimeRange: timeRanges.onSiteTimeRange,
    clientPresentTimeRange,
    moveableTimeRange: timeRanges.moveableTimeRange
  }
}

/**
 * Derive the TimeRange for a given perspective
 * 
 * @param slot - AppointmentSlot with precomputed totals
 * @param perspective - Which perspective to derive
 * @returns TimeRange for display, or null if not applicable
 * 
 * LEARNING: Falls back to totalTimeRange if perspective-specific range is null
 * WHY: Ensures buttons always have a display time, even when specific perspective ranges are null
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'onSite' | 'clientPresent' | 'nonDifferential'
): TimeRange | null {
  let result: TimeRange | null = null
  
  switch (perspective) {
    case 'onSite':
      // LEARNING: Fallback to totalTimeRange if onSiteTimeRange is null
      // WHY: Ensures buttons always have a display time
      result = slot.onSiteTimeRange ?? slot.totalTimeRange
      break
    case 'clientPresent':
      // LEARNING: Fallback to totalTimeRange if clientPresentTimeRange is null
      // WHY: Ensures buttons always have a display time
      result = slot.clientPresentTimeRange ?? slot.totalTimeRange
      break
    case 'nonDifferential':
      // LEARNING: Show on-site time for non-differential (same as inspector view)
      // WHY: Non-differential services should show inspector times on buttons, not total appointment time
      // PATTERN: Use onSiteTimeRange with fallback to totalTimeRange if null
      result = slot.onSiteTimeRange ?? slot.totalTimeRange
      break
    default:
      result = null
  }
  
  return result
}
