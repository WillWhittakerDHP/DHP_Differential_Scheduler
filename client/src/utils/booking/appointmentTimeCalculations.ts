/**
 * Appointment Slot Calculations
 * 
 * LEARNING: Functions to calculate AppointmentSlots from block instances
 * WHY: Groups parts by category and calculates time slots for differential scheduling
 * PATTERN: Collect parts, sort by orderIndex, group by category, calculate durations and time slots
 */

import type { AppointmentSlot, AppointmentSlots, TimeRange } from '@/types/appointment'
import type { BookingBlockInstance, BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getPartInstanceCategory } from './partShapeTimeSlotMapping'
import { createTimeRange, createTimeSlot as createTimeSlotWithFlags } from './appointmentSlotBuilder'

/**
 * Group parts by time slot category
 * LEARNING: Categorizes parts using part shape mapping
 * WHY: Groups parts for calculating category-specific time slots
 * PATTERN: Map over parts, categorize each, group by category key
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Map of category key to array of parts in that category
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
 * Calculate total duration for a group of parts
 * LEARNING: Sums baseTime values from parts, but returns 0 if category should be zeroed out
 * WHY: Provides total duration for a category, respecting zeroOutPart flag
 * PATTERN: Check for zeroOutPart flag first, then reduce parts to sum of baseTime values
 * 
 * @param parts - Array of BookingPartInstance objects
 * @returns Total duration in minutes (0 if category should be zeroed out)
 */
function calculateCategoryDuration(parts: BookingPartInstance[]): number {
  if (shouldZeroOutCategory(parts)) {
    return 0
  }
  return parts.reduce((sum, part) => sum + (part.baseTime || 0), 0)
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
  // FIX: Use flatMap instead of forEach with push mutations
  const allParts: BookingPartInstance[] = blockInstances.flatMap(blockInstance => 
    blockInstance.partInstances && blockInstance.partInstances.length > 0 
      ? blockInstance.partInstances 
      : []
  )
  
  if (allParts.length === 0) {
    return []
  }
  
  // LEARNING: Sort parts by orderIndex
  // WHY: Maintains correct order for time slot calculations
  // PATTERN: Sort by orderIndex ascending
  const sortedParts = [...allParts].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  
  // LEARNING: Group parts by time slot category
  // WHY: Calculate category-specific durations and time slots
  // PATTERN: Use mapping function to categorize parts
  const partsByCategory = groupPartsByCategory(sortedParts)
  
  // LEARNING: Filter out parts from zeroed categories before calculating totals
  // WHY: Zeroed categories should not contribute to total durations
  // PATTERN: Filter sortedParts to exclude parts in categories that should be zeroed out
  // FIX: Use Array.from().filter() instead of forEach with Set mutations
  const getNonZeroedParts = (): BookingPartInstance[] => {
    const zeroedCategories = new Set<string>(
      Array.from(partsByCategory.entries())
        .filter(([, categoryParts]) => shouldZeroOutCategory(categoryParts))
        .map(([category]) => category)
    )
    
    return sortedParts.filter(part => {
      const category = getPartInstanceCategory(part)
      return !category || !zeroedCategories.has(category)
    })
  }
  
  const nonZeroedParts = getNonZeroedParts()
  
  // LEARNING: Calculate total time (sum of all parts' baseTime, excluding zeroed categories)
  // WHY: Provides total appointment duration
  // PATTERN: Sum all baseTime values from non-zeroed parts
  const totalDuration = nonZeroedParts.reduce((sum, part) => sum + (part.baseTime || 0), 0)
  
  // LEARNING: Calculate timeOnSite (sum of parts where onSite === true, excluding zeroed categories)
  // WHY: Provides inspector on-site duration before client arrives
  // PATTERN: Filter by onSite, sum baseTime values from non-zeroed parts
  const onSiteParts = nonZeroedParts.filter(part => part.onSite === true)
  const timeOnSiteDuration = calculateCategoryDuration(onSiteParts)
  
  // LEARNING: Calculate category-specific durations
  // WHY: Provides durations for each category (earlyArrival, dataCollection, etc.)
  // PATTERN: Calculate duration for each category group
  const earlyArrivalDuration = calculateCategoryDuration(partsByCategory.get('earlyArrival') || [])
  const dataCollectionDuration = calculateCategoryDuration(partsByCategory.get('dataCollection') || [])
  const reportWritingDuration = calculateCategoryDuration(partsByCategory.get('reportWriting') || [])
  const clientPresentationDuration = calculateCategoryDuration(partsByCategory.get('clientPresentation') || [])
  
  // LEARNING: Helper function to get flags for a category from its parts
  // WHY: TimeSlot objects need onSite, clientPresent, moveable, and isAvailable flags
  // PATTERN: Check if any part in category has the flag set to true
  const getCategoryFlags = (categoryParts: BookingPartInstance[]): { onSite: boolean; clientPresent: boolean; moveable: boolean; isAvailable: boolean } => {
    return {
      onSite: categoryParts.some(part => part.onSite === true),
      clientPresent: categoryParts.some(part => part.clientPresent === true),
      moveable: categoryParts.some(part => part.moveable === true),
      isAvailable: true  // Default to available for category shapes
    }
  }

  // LEARNING: Create AppointmentSlot object with calculated durations
  // WHY: Provides normalized structure with orderIndex and category-specific time slots
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
    earlyArrival: baseStartTime && earlyArrivalDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          earlyArrivalDuration,
          getCategoryFlags(partsByCategory.get('earlyArrival') || [])
        )
      : null,
    dataCollection: baseStartTime && dataCollectionDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          dataCollectionDuration,
          getCategoryFlags(partsByCategory.get('dataCollection') || [])
        )
      : null,
    reportWriting: baseStartTime && reportWritingDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          reportWritingDuration,
          getCategoryFlags(partsByCategory.get('reportWriting') || [])
        )
      : null,
    clientPresentation: baseStartTime && clientPresentationDuration > 0
      ? createTimeSlotWithFlags(
          baseStartTime,
          clientPresentationDuration,
          getCategoryFlags(partsByCategory.get('clientPresentation') || [])
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

