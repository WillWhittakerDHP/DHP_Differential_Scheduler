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
import { calculateDurationFromBlockInstances } from '@/utils/timeSlotCalculations'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { fitAllTimeSlotsWithAvailability, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import { hasValidDateRangeStructure, validateDateRange } from '@/utils/booking/dateRangeValidation'
import type { PropertyDetails } from '@/types/availability'
import { useNotification } from '@/composables/useNotification'
import { ConstraintValidationError } from '@/utils/booking/slotAvailabilityManager'
import type { ComputedAvailabilityData, RangeConstraint, OverlapConstraint, CapacityConstraint } from '@shared/types/availabilityTypes'

const { error: showErrorNotification } = useNotification()

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
  propertyDetails?: PropertyDetails | null | Ref<PropertyDetails | null> | ComputedRef<PropertyDetails | null>,
  _settings?: Ref<AvailabilitySettings | null> | ComputedRef<AvailabilitySettings | null>, // @deprecated Phase 12: Use prefetchedData.minuteIncrement instead (unused, kept for backward compat)
  // Phase 6: Optional pre-computed availability data from server orchestrator
  prefetchedData?: Ref<ComputedAvailabilityData | null> | ComputedRef<ComputedAvailabilityData | null>
) {
  // PATTERN: Ref with watch to update asynchronously when dependencies change
  const timeSlots = ref<TimeSlot[]>([])

  // LEARNING: Error state for error handling and user feedback
  // PATTERN: Ref to track errors, exposed as computed for reactivity
  const error = ref<Error | null>(null)

  // LEARNING: Loading state for async operations
  // PATTERN: Ref to track loading state, exposed as computed for reactivity
  const isLoading = ref(false)

  // PATTERN: Computed properties that unref refs/computed refs
  const blockInstancesValue = computed(() => unref(blockInstances))
  const dateRangeValue = computed(() => unref(dateRange))
  const propertyDetailsValue = computed(() => unref(propertyDetails))
  
  // Phase 12: Add prefetchedData to watch dependencies so watch re-fires when server data arrives
  // WHY: prefetchedData arrives asynchronously from server, watch must re-trigger when it becomes available
  // PATTERN: Computed wrapper ensures reactivity
  const prefetchedDataValue = computed(() => prefetchedData?.value ?? null)

  // PATTERN: Create new AbortController for each watch execution, abort previous one
  let abortController: AbortController | null = null

  // PATTERN: Watch multiple dependencies, call synchronous function to update ref
  // P0-1: Added AbortController to prevent race conditions
  // Phase 12: Added prefetchedDataValue to watch array so watch re-fires when server data arrives
  // Phase 12: Function is now synchronous - all data is pre-computed server-side
  watch(
    [blockInstancesValue, dateRangeValue, propertyDetailsValue, prefetchedDataValue],
    () => {
      abortController?.abort()
      abortController = new AbortController()
      const { signal } = abortController

      const blockInstances = blockInstancesValue.value
      const dateRange = dateRangeValue.value
      const propertyDetails = propertyDetailsValue.value

      // WHY: Prevents calculation errors when data is incomplete
      // PATTERN: Early return with empty array fallback
      if (!blockInstances || blockInstances.length === 0 || !hasValidDateRangeStructure(dateRange)) {
        if (signal.aborted) return
        error.value = null
        isLoading.value = false
        timeSlots.value = []
        return
      }
      const validatedDateRange = validateDateRange(dateRange)
      if (!validatedDateRange) {
        if (signal.aborted) return
        error.value = null
        isLoading.value = false
        timeSlots.value = []
        return
      }

      try {
        isLoading.value = true
        error.value = null
        // PATTERN: Use utility function to calculate duration from all block instances
        const duration = calculateDurationFromBlockInstances(blockInstances)
        // PATTERN: Early return with error state if duration is invalid
        if (duration <= 0) {
          const errorMessage = `Invalid duration: ${duration} minutes`
          error.value = new Error(errorMessage)
          showErrorNotification(errorMessage)
          timeSlots.value = []
          isLoading.value = false
          return
        }
        if (signal.aborted) return

        // Phase 12: Use pre-computed data from server orchestrator (required)
        // WHY: All data fetching and constraint extraction happens server-side
        // PATTERN: Synchronous consumption of pre-computed data
        const prefetched = prefetchedData?.value
        if (!prefetched) {
          // Pre-computed data is required - this composable should only be used with orchestrator data
          const errorMessage = 'useAvailability requires pre-computed availability data from server orchestrator'
          error.value = new Error(errorMessage)
          showErrorNotification(errorMessage)
          timeSlots.value = []
          isLoading.value = false
          return
        }
        
        const busyTimes: BusyTimeRange[] = prefetched.busyPeriods
        const rangeConstraints: RangeConstraint[] = prefetched.rangeConstraints
        const overlapConstraints: OverlapConstraint[] = prefetched.overlapConstraints
        const capacityConstraints: CapacityConstraint[] = prefetched.capacityConstraints

        // Phase 12: Use server-provided minuteIncrement instead of fetching settings
        // WHY: Server already includes minuteIncrement in ComputedAvailabilityData, eliminating redundant API call
        // PATTERN: Direct use of pre-computed data makes function synchronous
        const minuteIncrement = prefetched.minuteIncrement

        // WHY: Generates ALL slots and marks them as available/busy instead of filtering
        // PATTERN: Use fitAllTimeSlotsWithAvailability for unified availability handling
        // Session 2.2.3: Pass calendar events and defaultLocation for drive time calculations
        // Phase 12: Function is now synchronous (all data pre-computed server-side, no async settings fetch)
        const result = fitAllTimeSlotsWithAvailability({  // P3-6: Renamed for clarity
          startBoundary: validatedDateRange.start,
          endBoundary: validatedDateRange.end,
          duration,
          minuteIncrement,
          busyTimes,
          includeFlags: { major: false, minor: false, moveable: false }
        }, rangeConstraints, overlapConstraints, capacityConstraints, {
          // Phase 6: Pass pre-computed data from server orchestrator
          precomputedDriveTimesByDate: prefetched.driveTimesByDate,
          precomputedCapacityHours: prefetched.scheduledHoursByKey
        })
        if (signal.aborted) return

        // PATTERN: Calculate adjustments and modify slots if needed
        if (propertyDetails) {
        }

        // WHY: UI can render busy slots as inactive instead of hiding them
        // PATTERN: Use slots from availability manager result
        timeSlots.value = result.slots
        error.value = null
      } catch (err) {
        // PATTERN: Set empty array on error, store error for UI feedback, show notification for constraint errors
        if (signal.aborted) return
        
        if (err instanceof ConstraintValidationError) {
          const errorMessage = `Invalid ${err.constraintType} constraint configuration: ${err.message}`
          error.value = err
          showErrorNotification(errorMessage)
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error generating time slots'
          error.value = err instanceof Error ? err : new Error(errorMessage)
          showErrorNotification(`Failed to generate time slots: ${errorMessage}`)
        }
        timeSlots.value = []
      } finally {
        if (!signal.aborted) {
          isLoading.value = false
        }
      }
    },
    { immediate: true } // Run immediately on mount
  )

  return {
    timeSlots: computed(() => timeSlots.value), // Return as computed for consistency
    error: computed(() => error.value), // P1-3: Expose error state
    hasError: computed(() => error.value !== null), // P1-3: Convenience computed for error check
    isLoading: computed(() => isLoading.value) // P1-3: Expose loading state
  }
}

