/**
 * Appointment Slot Calculations
 * 
 * LEARNING: Functions to calculate AppointmentSlots from block instances
 * WHY: Groups parts by flag combinations and calculates time slots for differential scheduling
 * PATTERN: Collect parts, create finalized parts, group by flags, calculate durations and time slots
 */

import type { AppointmentSlot, AppointmentSlots } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import { buildAppointmentShape, applyShapeToTime } from './appointmentSlotBuilder'

/**
 * Calculate AppointmentSlots from block instances
 * LEARNING: Uses buildAppointmentShape and applyShapeToTime for consistency
 * WHY: Creates normalized AppointmentSlots structure using the new architecture
 * PATTERN: Build shape once, apply to start time
 * 
 * LEARNING: Events are optional - if not provided, AppointmentShape will have empty eventAssignmentsByPartShape
 * WHY: Backward compatibility - some callers may not have access to events data
 * PATTERN: Make events data optional parameters
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options)
 * @param baseStartTime - Optional base start time (ISO date string) - if provided, calculates TimeRange objects
 * @param eventInstances - Optional array of EventInstance objects
 * @param eventShapes - Optional array of EventShape objects
 * @param eventAssignmentsRelationships - Optional array of eventAssignments relationships
 * @param partShapeById - Optional map of partShape ID → partShape entity
 * @returns Array of AppointmentSlot objects with orderIndex 0
 */
export function calculateAppointmentSlots(
  blockInstances: BookingBlockInstance[],
  baseStartTime?: string | null,
  eventInstances?: EventInstance[],
  eventShapes?: EventShape[],
  eventAssignmentsRelationships?: GlobalRelationship[],
  partShapeById?: Map<string, GlobalEntity<'partShape'>>
): AppointmentSlots {
  if (!blockInstances || blockInstances.length === 0) {
    return []
  }
  
  // LEARNING: Build AppointmentShape from block instances with optional events data
  // WHY: Shape contains finalized parts and SlotShape (source of truth)
  // PATTERN: Use buildAppointmentShape to create shape, pass events data if available
  const shape = buildAppointmentShape(
    blockInstances, 
    null,
    eventInstances,
    eventShapes,
    eventAssignmentsRelationships,
    partShapeById
    // LEARNING: Removed 3 undefined arguments (validPartsRelationships, globalData)
    // WHY: Function signature only accepts 8 parameters, not 9
    // PATTERN: Only pass required parameters, omit optional ones that aren't needed
  )
  
  // LEARNING: Apply shape to start time if provided
  // WHY: Creates AppointmentSlot with TimeRanges from SlotShape
  // PATTERN: Use applyShapeToTime to create slot
  if (baseStartTime) {
    const appointmentSlot = applyShapeToTime(shape, baseStartTime, 0, undefined, true, undefined, undefined)
    return [appointmentSlot]
  }
  
  // LEARNING: Return slot without time ranges if no start time provided
  // WHY: Some callers may only need the shape structure
  // PATTERN: Create minimal slot with shape reference
  // Session Event Refactor: Use eventTimeRanges Record instead of hardcoded properties
  const appointmentSlot: AppointmentSlot = {
    buttonIndex: 0,
    isAvailable: true,
    orderIndex: 0,
    shape,
    startTime: '',
    totalTimeRange: null,
    eventTimeRanges: {}
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
    return sum + (appointmentSlot.totalTimeRange?.duration || appointmentSlot.shape.slotShape.totalDuration || 0)
  }, 0)
}

