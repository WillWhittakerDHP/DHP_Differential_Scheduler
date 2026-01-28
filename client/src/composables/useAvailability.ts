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
import { getAvailabilitySettings, type AvailabilitySettings } from '@/configs/availabilitySettings'
import { fitAllTimeSlotsWithAvailability, type BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import { preprocessBusyPeriods } from '@/utils/booking/timeAvailabilityManager'
import { hasValidDateRangeStructure, validateDateRange } from '@/utils/booking/dateRangeValidation'
import type { PropertyDetails } from '@/types/availability'
import { useNotification } from '@/composables/useNotification'
import { ConstraintValidationError } from '@/utils/booking/timeAvailabilityManager'
import { ensureDateRangeInSettings, extractAllConstraints } from '@/utils/booking/constraintHelpers'

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
  settings?: Ref<AvailabilitySettings | null> | ComputedRef<AvailabilitySettings | null> // P2-1: Optional shared settings
) {
  // LEARNING: Ref for time slots array (reactive)
  // WHY: Provides reactive time slot calculation that updates when block instances or dateRange changes
  // PATTERN: Ref with watch to update asynchronously when dependencies change
  // Session 1.4.1: Changed from computed to ref+watch to handle async generateTimeSlots
  const timeSlots = ref<TimeSlot[]>([])

  // LEARNING: Error state for error handling and user feedback
  // WHY: Allows UI to display error messages when slot generation fails
  // PATTERN: Ref to track errors, exposed as computed for reactivity
  // P1-3: Added error state exposure
  const error = ref<Error | null>(null)

  // LEARNING: Loading state for async operations
  // WHY: Allows UI to show loading indicators during slot generation
  // PATTERN: Ref to track loading state, exposed as computed for reactivity
  // P1-3: Added loading state exposure
  const isLoading = ref(false)

  // LEARNING: Computed properties for reactive dependencies
  // WHY: Unrefs parameters to get reactive values for watch
  // PATTERN: Computed properties that unref refs/computed refs
  const blockInstancesValue = computed(() => unref(blockInstances))
  const dateRangeValue = computed(() => unref(dateRange))
  const propertyDetailsValue = computed(() => unref(propertyDetails))

  // LEARNING: AbortController to cancel stale async operations
  // WHY: Prevents race conditions where stale results overwrite fresh ones
  // PATTERN: Create new AbortController for each watch execution, abort previous one
  let abortController: AbortController | null = null

  // LEARNING: Watch dependencies and update time slots asynchronously
  // WHY: Updates time slots when block instances or dateRange changes
  // PATTERN: Watch multiple dependencies, call async function to update ref
  // Session 1.4.1: Updated to handle async generateTimeSlots
  // P0-1: Added AbortController to prevent race conditions
  watch(
    [blockInstancesValue, dateRangeValue, propertyDetailsValue],
    async () => {
      // Cancel previous request if still pending
      abortController?.abort()
      abortController = new AbortController()
      const { signal } = abortController

      const blockInstances = blockInstancesValue.value
      const dateRange = dateRangeValue.value
      const propertyDetails = propertyDetailsValue.value

      // LEARNING: Return empty array if required parameters are missing
      // WHY: Prevents calculation errors when data is incomplete
      // PATTERN: Early return with empty array fallback
      // P2-3: Use shared date range validation utility
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
        // LEARNING: Calculate duration from all accumulated block instances
        // WHY: Duration includes time from base service + property type block + availability options
        // PATTERN: Use utility function to calculate duration from all block instances
        const duration = calculateDurationFromBlockInstances(blockInstances)
        // P2-6: Add duration validation in caller
        // LEARNING: Validate duration before passing to slot generation
        // WHY: Prevents invalid slot generation and provides clear error feedback
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

        // LEARNING: Get calendar availability (busy times)
        // WHY: Mark slots that conflict with existing appointments as unavailable
        // PATTERN: Use utility function to get busy times from mock/real calendar
        // NOTE: hasValidDateRangeStructure check above ensures start and end are non-null
        const rawBusyTimes = getCalendarAvailability({
          start: validatedDateRange.start,
          end: validatedDateRange.end
        })
        // P1-6: Apply busy period validation consistently
        // LEARNING: Validate and merge busy periods before slot generation
        // WHY: Ensures invalid busy periods don't cause incorrect availability
        // PATTERN: Use preprocessBusyPeriods to validate, sort, and merge
        const busyTimes = preprocessBusyPeriods(rawBusyTimes as BusyTimeRange[])
        if (signal.aborted) return

        // P2-1: Use shared settings if provided, otherwise fetch
        // LEARNING: Accept shared settings to avoid redundant fetching
        // WHY: Allows parent to provide settings via provide/inject pattern
        // PATTERN: Use provided settings or fetch if not available
        let settingsValue: AvailabilitySettings
        if (settings?.value) {
          settingsValue = settings.value
        } else {
          // Fallback to fetching if not provided
          settingsValue = await getAvailabilitySettings()
        }
        if (signal.aborted) return

        // LEARNING: Ensure dateRange is set in structured rangeConstraints before extraction
        // WHY: No fallbacks - all constraints must be in structured format
        // PATTERN: Use helper function to set dateRange in rangeConstraints if not already present
        // NOTE: hasValidDateRangeStructure check above ensures start and end are non-null
        const settingsWithDateRange = ensureDateRangeInSettings(settingsValue, {
          start: validatedDateRange.start,
          end: validatedDateRange.end
        })

        // LEARNING: Extract all constraints using shared helper function
        // WHY: DRY principle - eliminates duplication across composables
        // PATTERN: Use extractAllConstraints helper to extract all constraint types at once
        const { rangeConstraints, overlapConstraints, capacityConstraints } = extractAllConstraints(settingsWithDateRange)

        // LEARNING: Use unified availability manager to generate all slots with availability flags
        // WHY: Generates ALL slots and marks them as available/busy instead of filtering
        // PATTERN: Use fitAllTimeSlotsWithAvailability for unified availability handling
        const result = await fitAllTimeSlotsWithAvailability({  // P3-6: Renamed for clarity
          startBoundary: validatedDateRange.start,
          endBoundary: validatedDateRange.end,
          duration,
          minuteIncrement: settingsValue.minuteIncrement,
          busyTimes,
          includeFlags: { onSite: false, clientPresent: false, moveable: false }
        }, rangeConstraints, overlapConstraints, capacityConstraints)
        if (signal.aborted) return

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
        error.value = null
      } catch (err) {
        // LEARNING: Handle calculation errors gracefully with UI notifications
        // WHY: Prevents crashes if calculation fails, shows user-friendly error messages
        // PATTERN: Set empty array on error, store error for UI feedback, show notification for constraint errors
        // Ignore abort errors (they're expected when cancelling stale requests)
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

