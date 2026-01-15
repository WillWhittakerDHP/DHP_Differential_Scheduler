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
  CategoryShape, 
  AppointmentShape, 
  AppointmentSlot 
} from '@/types/appointment'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getPartInstanceCategory } from './partShapeTimeSlotMapping'
import { roundUpToIncrement } from '@/utils/timeSlotCalculations'

/**
 * Create a TimeRange from start time and duration
 */
export function createTimeRange(startTime: string, duration: number): TimeRange {
  const start = new Date(startTime)
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + duration)
  
  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    duration
  }
}

/**
 * Create a TimeSlot from start time, duration, and flags
 */
export function createTimeSlot(
  startTime: string,
  duration: number,
  flags: { onSite: boolean; clientPresent: boolean; moveable: boolean }
): TimeSlot {
  const range = createTimeRange(startTime, duration)
  
  return {
    ...range,
    onSite: flags.onSite,
    clientPresent: flags.clientPresent,
    moveable: flags.moveable
  }
}

/**
 * Sum baseTime for parts matching a predicate
 */
export function sumDuration(
  parts: BookingPartInstance[],
  predicate: (part: BookingPartInstance) => boolean
): number {
  return parts
    .filter(predicate)
    .reduce((sum, part) => sum + (part.baseTime || 0), 0)
}

/**
 * Sum baseTime for parts where onSite === true
 */
export function sumOnSite(parts: BookingPartInstance[]): number {
  return sumDuration(parts, part => part.onSite === true)
}

/**
 * Sum baseTime for parts where clientPresent === true
 */
export function sumClientPresent(parts: BookingPartInstance[]): number {
  return sumDuration(parts, part => part.clientPresent === true)
}

/**
 * Sum baseTime for parts where moveable === true
 */
export function sumMoveable(parts: BookingPartInstance[]): number {
  return sumDuration(parts, part => part.moveable === true)
}

/**
 * Sum baseTime for all parts
 */
export function sumTotal(parts: BookingPartInstance[]): number {
  return parts.reduce((sum, part) => sum + (part.baseTime || 0), 0)
}

/**
 * Group parts by time slot category
 */
function groupPartsByCategory(parts: BookingPartInstance[]): Map<string, BookingPartInstance[]> {
  // FIX: Use reduce instead of forEach with mutations
  return parts.reduce((grouped, part) => {
    const category = getPartInstanceCategory(part)
    if (category) {
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(part)
    }
    return grouped
  }, new Map<string, BookingPartInstance[]>())
}

/**
 * Check if a category should be zeroed out
 * LEARNING: If any part instance in a category has zeroOutPart: true, the entire category is zeroed
 * WHY: Allows parts like "no Client Presentation" to zero out the entire category
 * PATTERN: Check if any part in category has zeroOutPart flag set
 */
function shouldZeroOutCategory(categoryParts: BookingPartInstance[]): boolean {
  return categoryParts.some(part => part.zeroOutPart === true)
}

/**
 * Build AppointmentShape from block instances
 * 
 * Calculates durations, flags, and offsets (no times).
 * This is calculated once and reused for each available start time.
 */
export function buildAppointmentShape(blockInstances: BookingBlockInstance[]): AppointmentShape {
  if (!blockInstances || blockInstances.length === 0) {
    return {
      earlyArrival: null,
      dataCollection: null,
      reportWriting: null,
      clientPresentation: null,
      totalOnSiteDuration: 0,
      totalClientPresentDuration: 0,
      totalMoveableDuration: 0,
      totalDuration: 0,
      clientStartOffset: 0
    }
  }
  
  // Collect all parts from block instances
  // FIX: Use flatMap instead of forEach with push mutations
  const allParts: BookingPartInstance[] = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  if (allParts.length === 0) {
    return {
      earlyArrival: null,
      dataCollection: null,
      reportWriting: null,
      clientPresentation: null,
      totalOnSiteDuration: 0,
      totalClientPresentDuration: 0,
      totalMoveableDuration: 0,
      totalDuration: 0,
      clientStartOffset: 0
    }
  }
  
  // Group parts by category
  const partsByCategory = groupPartsByCategory(allParts)
  
  // LEARNING: Filter out parts from zeroed categories before calculating totals
  // WHY: Zeroed categories should not contribute to total durations
  // PATTERN: Filter allParts to exclude parts in categories that should be zeroed out
  // FIX: Use Array.from().filter() instead of forEach with Set mutations
  const getNonZeroedParts = (): BookingPartInstance[] => {
    const zeroedCategories = new Set<string>(
      Array.from(partsByCategory.entries())
        .filter(([, categoryParts]) => shouldZeroOutCategory(categoryParts))
        .map(([category]) => category)
    )
    
    return allParts.filter(part => {
      const category = getPartInstanceCategory(part)
      return !category || !zeroedCategories.has(category)
    })
  }
  
  const nonZeroedParts = getNonZeroedParts()
  
  // Calculate category shapes
  const buildCategoryShape = (categoryParts: BookingPartInstance[]): CategoryShape | null => {
    if (categoryParts.length === 0) return null
    
    // LEARNING: If any part has zeroOutPart: true, zero out the entire category
    // WHY: Allows parts like "no Client Presentation" to zero out the entire category
    if (shouldZeroOutCategory(categoryParts)) {
      return null
    }
    
    return {
      duration: sumTotal(categoryParts),
      onSite: categoryParts.some(part => part.onSite === true),
      clientPresent: categoryParts.some(part => part.clientPresent === true),
      moveable: categoryParts.some(part => part.moveable === true)
    }
  }
  
  // Calculate total durations (excluding zeroed categories)
  const totalOnSiteDuration = sumOnSite(nonZeroedParts)
  const totalClientPresentDuration = sumClientPresent(nonZeroedParts)
  const totalMoveableDuration = sumMoveable(nonZeroedParts)
  const totalDuration = sumTotal(nonZeroedParts)
  
  // LEARNING: Round on-site duration up to nearest 15-minute increment
  // WHY: Ensures end times align with standard time increments (:00, :15, :30, :45)
  // PATTERN: Use ceiling function to round up durations
  const roundedOnSiteDuration = roundUpToIncrement(totalOnSiteDuration, 15)
  
  // Calculate clientStartOffset: duration of parts where onSite=true AND clientPresent=false
  // LEARNING: Exclude zeroed categories from clientStartOffset calculation
  // WHY: Zeroed categories should not contribute to timing offsets
  const clientStartOffset = sumDuration(
    nonZeroedParts,
    part => part.onSite === true && part.clientPresent === false
  )
  
  const shape = {
    earlyArrival: buildCategoryShape(partsByCategory.get('earlyArrival') || []),
    dataCollection: buildCategoryShape(partsByCategory.get('dataCollection') || []),
    reportWriting: buildCategoryShape(partsByCategory.get('reportWriting') || []),
    clientPresentation: buildCategoryShape(partsByCategory.get('clientPresentation') || []),
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
  fallbackDuration?: number
): AppointmentSlot {
  // Apply each category shape to startTime
  const applyCategoryShape = (categoryShape: CategoryShape | null): TimeSlot | null => {
    if (!categoryShape || categoryShape.duration === 0) return null
    
    return createTimeSlot(startTime, categoryShape.duration, {
      onSite: categoryShape.onSite,
      clientPresent: categoryShape.clientPresent,
      moveable: categoryShape.moveable
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
    earlyArrival: applyCategoryShape(shape.earlyArrival),
    dataCollection: applyCategoryShape(shape.dataCollection),
    reportWriting: applyCategoryShape(shape.reportWriting),
    clientPresentation: applyCategoryShape(shape.clientPresentation),
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
