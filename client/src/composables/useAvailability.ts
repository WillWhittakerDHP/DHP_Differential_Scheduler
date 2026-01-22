/**
 * useAvailability Composable
 * 
 * LEARNING: Vue composable for calculating available time slots client-side
 * WHY: Calculates time slots from part instances without API dependency
 * PATTERN: Reactive computed properties for client-side calculations
 * Session 1.3.7: Refactored to client-side calculations
 */

import { computed, ref, watch, type Ref, type ComputedRef, unref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { calculateDurationFromBlockInstances, getCalendarAvailability } from '@/utils/timeSlotCalculations'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'
import { fitTimeSlotsWithAvailability, type BusinessHoursMap } from '@/utils/booking/timeSlotFitter'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('useAvailability')

/**
 * useAvailability composable
 * LEARNING: Calculates available time slots for a date range and accumulated block instances
 * WHY: Centralizes availability calculation logic with reactive state management
 * PATTERN: Computed properties that reactively calculate time slots
 * Session 1.3.7: Refactored from API query to client-side calculation
 * Session 1.3.7: Updated to handle all block instance types (service, property type block, availability options)
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options) (can be ref/computed)
 * @param dateRange - Object with start and end ISO date strings (can be ref/computed)
 * @param propertyDetails - Optional property details for future adjustments (can be ref/computed)
 * @returns Reactive computed property with time slots array
 */
export function useAvailability(
  blockInstances: BookingBlockInstance[] | Ref<BookingBlockInstance[]> | ComputedRef<BookingBlockInstance[]>,
  dateRange: { start: string | null; end: string | null } | null | Ref<{ start: string | null; end: string | null } | null> | ComputedRef<{ start: string | null; end: string | null } | null>,
  propertyDetails?: Record<string, unknown> | null | Ref<Record<string, unknown> | null> | ComputedRef<Record<string, unknown> | null>
) {
  // LEARNING: Ref for time slots array (reactive)
  // WHY: Provides reactive time slot calculation that updates when block instances or dateRange changes
  // PATTERN: Ref with watch to update asynchronously when dependencies change
  // Session 1.4.1: Changed from computed to ref+watch to handle async generateTimeSlots
  const timeSlots = ref<TimeSlot[]>([])

  // LEARNING: Computed properties for reactive dependencies
  // WHY: Unrefs parameters to get reactive values for watch
  // PATTERN: Computed properties that unref refs/computed refs
  const blockInstancesValue = computed(() => unref(blockInstances))
  const dateRangeValue = computed(() => unref(dateRange))
  const propertyDetailsValue = computed(() => unref(propertyDetails))

  // LEARNING: Watch dependencies and update time slots asynchronously
  // WHY: Updates time slots when block instances or dateRange changes
  // PATTERN: Watch multiple dependencies, call async function to update ref
  // Session 1.4.1: Updated to handle async generateTimeSlots
  watch(
    [blockInstancesValue, dateRangeValue, propertyDetailsValue],
    async () => {
      const blockInstances = blockInstancesValue.value
      const dateRange = dateRangeValue.value
      const propertyDetails = propertyDetailsValue.value

      // LEARNING: Return empty array if required parameters are missing
      // WHY: Prevents calculation errors when data is incomplete
      // PATTERN: Early return with empty array fallback
      if (!blockInstances || blockInstances.length === 0 || !dateRange?.start || !dateRange?.end) {
        timeSlots.value = []
        return
      }

      try {
        // LEARNING: Calculate duration from all accumulated block instances
        // WHY: Duration includes time from base service + property type block + availability options
        // PATTERN: Use utility function to calculate duration from all block instances
        const duration = calculateDurationFromBlockInstances(blockInstances)

        // LEARNING: Get calendar availability (busy times)
        // WHY: Mark slots that conflict with existing appointments as unavailable
        // PATTERN: Use utility function to get busy times from mock/real calendar
        const busyTimes = getCalendarAvailability({
          start: dateRange.start,
          end: dateRange.end
        })

        // LEARNING: Get availability settings for business hours and increments
        // WHY: Needed for unified availability manager
        // PATTERN: Fetch settings asynchronously
        const settings = await getAvailabilitySettings()

        // LEARNING: Use unified availability manager to generate all slots with availability flags
        // WHY: Generates ALL slots and marks them as available/busy instead of filtering
        // PATTERN: Use fitTimeSlotsWithAvailability for unified availability handling
        const result = fitTimeSlotsWithAvailability({
          startBoundary: dateRange.start,
          endBoundary: dateRange.end,
          duration,
          businessHours: settings.businessHours as BusinessHoursMap,
          minuteIncrement: settings.minuteIncrement,
          busyTimes,
          includeFlags: { onSite: false, clientPresent: false, moveable: false }
        })

        // LEARNING: Future enhancement - apply property-based adjustments
        // WHY: Different properties may require different time allocations
        // PATTERN: Calculate adjustments and modify slots if needed
        // TODO: Session 1.3.7 - Apply property-based adjustments when implemented
        if (propertyDetails) {
          // Property adjustments will be applied here in future
        }

        // LEARNING: Return all slots with availability flags
        // WHY: UI can render busy slots as inactive instead of hiding them
        // PATTERN: Use slots from availability manager result
        timeSlots.value = result.slots
      } catch (error) {
        // LEARNING: Handle calculation errors gracefully
        // WHY: Prevents crashes if calculation fails
        // PATTERN: Set empty array on error
        logger.error('Error generating time slots:', error)
        timeSlots.value = []
      }
    },
    { immediate: true } // Run immediately on mount
  )

  return {
    timeSlots: computed(() => timeSlots.value) // Return as computed for consistency
  }
}

