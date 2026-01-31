/**
 * useAvailabilityDefaults Composable
 * 
 * LEARNING: Handles default date selection and loaded appointment state matching
 * WHY: Extracts defaulting logic and watchers from AvailabilityStep component
 * PATTERN: Composable that manages selectedDate state and auto-selection logic
 * 
 * Features:
 * - Auto-select first available date when time slots load
 * - Match loaded time slots from appointment
 * - Watch loaded wizard state and populate selectedDate
 * - Manage selectedDate, startTimeType, inspectorTimeSlot, clientTimeSlot state
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { matchLoadedTimeSlots } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ISO8601Date } from '@/types/datetime'

/**
 * useAvailabilityDefaults composable options
 */
export interface UseAvailabilityDefaultsOptions {
  /**
   * Loaded wizard state (for populating from appointment)
   */
  loadedWizardState: Ref<WizardStateData | null>
  
  /**
   * Available time slots
   */
  timeSlots: ComputedRef<TimeSlot[] | null>
  
  /**
   * Whether the selected service supports differential scheduling
   */
  isDifferentialService: ComputedRef<boolean>
}

/**
 * useAvailabilityDefaults composable return type
 */
export interface UseAvailabilityDefaultsReturn {
  /**
   * Selected date state
   * LEARNING: Uses ISO 8601 date format (YYYY-MM-DD) for date-only values
   */
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  
  /**
   * Start time type (inspector, client, or nonDifferential for non-differential services)
   */
  startTimeType: Ref<'inspector' | 'client' | 'nonDifferential'>
  
  /**
   * Appointment slot order index (position in availability grid)
   * LEARNING: Single orderIndex that persists across perspective changes
   * WHY: Same button regardless of inspector/client view - only display time and color change
   */
  appointmentSlotOrderIndex: Ref<number | null>
  
  /**
   * Inspector order index (backward compatibility)
   * LEARNING: Derived from appointmentSlotOrderIndex for backward compatibility
   */
  inspectorOrderIndex: Ref<number | null>
  
  /**
   * Client order index (backward compatibility)
   * LEARNING: Derived from appointmentSlotOrderIndex for backward compatibility
   */
  clientOrderIndex: Ref<number | null>
}

/**
 * useAvailabilityDefaults composable
 * LEARNING: Provides default date selection and state management for availability step
 * WHY: Centralizes defaulting logic and state management
 * PATTERN: Composable that manages state and sets up watchers
 * 
 * Features:
 * - Auto-selects first available date when time slots load (if no date selected)
 * - Matches loaded time slots from appointment to available slots
 * - Watches loaded wizard state and populates selectedDate
 * - Manages selectedDate, startTimeType, majorTimeSlot, minorTimeSlot state
 */
export function useAvailabilityDefaults(options: UseAvailabilityDefaultsOptions): UseAvailabilityDefaultsReturn {
  const { loadedWizardState, timeSlots, isDifferentialService } = options
  const { getFirstAvailabilityDate, getTodayDate } = useTimeFormatting()

  /**
   * Selected date state
   * LEARNING: Tracks user selections for date
   * WHY: Need reactive state for date selection
   * PATTERN: ref for date object with start/end
   * FIX: Initialize with today's date to break circular dependency (no date → no time slots → can't select date)
   *      Date is managed by user selection, not loaded from appointments
   */
  const selectedDate = ref<{ start: string | null; end: string | null }>({ 
    start: getTodayDate(), 
    end: null 
  })

  /**
   * Start time type state
   * LEARNING: Tracks whether to show major or minor time slots
   * WHY: Differential services need separate major/minor views, non-differential always uses 'nonDifferential'
   * PATTERN: ref for string literal union type - 'nonDifferential' for non-differential services, 'major' | 'minor' for differential
   * NOTE: Defaults to 'major' so step 3 starts in major view (legacy 'inspector' supported for backward compatibility)
   */
  const startTimeType = ref<'major' | 'minor' | 'nonDifferential' | 'inspector' | 'client'>('major')

  /**
   * Appointment slot order index state
   * LEARNING: Tracks selected appointment slot by orderIndex (position in availability grid)
   * WHY: Selection persists across perspective changes - same button, only display time and color change
   * PATTERN: ref for number (orderIndex) or null
   * NOTE: For differential services, inspector and client may see different times at same position,
   *       but it's the same appointment slot button. Selection state persists when switching perspectives.
   */
  const appointmentSlotOrderIndex = ref<number | null>(null)

  /**
   * Inspector order index state (backward compatibility)
   * LEARNING: Derived from appointmentSlotOrderIndex for backward compatibility with step data
   * WHY: Step data may need separate inspector/client TimeSlots, but selection uses single orderIndex
   * PATTERN: Writable computed ref that syncs with appointmentSlotOrderIndex
   * NOTE: This is kept for backward compatibility - actual selection uses appointmentSlotOrderIndex
   */
  const inspectorOrderIndex = computed({
    get: () => appointmentSlotOrderIndex.value,
    set: (value: number | null) => { appointmentSlotOrderIndex.value = value }
  }) as Ref<number | null>

  /**
   * Client order index state (backward compatibility)
   * LEARNING: Derived from appointmentSlotOrderIndex for backward compatibility with step data
   * WHY: Step data may need separate inspector/client TimeSlots, but selection uses single orderIndex
   * PATTERN: Writable computed ref that syncs with appointmentSlotOrderIndex
   * NOTE: This is kept for backward compatibility - actual selection uses appointmentSlotOrderIndex
   */
  const clientOrderIndex = computed({
    get: () => appointmentSlotOrderIndex.value,
    set: (value: number | null) => { appointmentSlotOrderIndex.value = value }
  }) as Ref<number | null>

  /**
   * Watch loaded wizard state and reset selectedDate to today
   * LEARNING: When loading dummy appointments for testing, always use today's date
   * WHY: Dummy appointments shouldn't affect date selection - we're testing time slot calculations, not past dates
   * PATTERN: Reset selectedDate to today whenever an appointment is loaded
   * NOTE: This ensures we always calculate slots for today/future, not past dates
   */
  watch(loadedWizardState, () => {
    // LEARNING: Always reset to today when loading appointments (dummy or real)
    // WHY: For testing, we need to test time slot calculations for today/future, not past dates
    // PATTERN: Reset selectedDate to today whenever loadedWizardState changes
    const today = getTodayDate()
    if (selectedDate.value.start !== today) {
      selectedDate.value = {
        start: today,
        end: null
      }
    }
    // Time slot matching happens in the next watcher below
  }, { immediate: true })

  /**
   * Watch both loaded wizard state and time slots to populate order index selections
   * LEARNING: Enables validation to pass when appointment is loaded with time slots
   * WHY: When appointment is loaded, match time slots from appointment to available slots and store orderIndex
   * PATTERN: Use helper function to match loaded time slots, then find orderIndex
   * NOTE: For now, we still use TimeSlot matching but will need to update to orderIndex-based matching
   * TODO: Update to use orderIndex-based matching when AppointmentSlots are available
   */
  watch([loadedWizardState, timeSlots], ([newState, availableSlots]) => {
    if (newState?.availability?.selectedTimeSlots && 
        newState.availability.selectedTimeSlots.length > 0 &&
        availableSlots && 
        availableSlots.length > 0) {
      // Temporary: Use TimeSlot matching for now, will be updated to orderIndex matching
      // This requires AppointmentSlots to be available, which will be handled in useAvailabilityUI
      // For now, we'll match by time and find the orderIndex in the UI layer
      // WHY: Transform selectedTimeSlots from { time, duration } format to { startTime, endTime } format
      const tempInspectorSlot = ref<TimeSlot | null>(null)
      const tempClientSlot = ref<TimeSlot | null>(null)
      const transformedSlots = newState.availability.selectedTimeSlots.map(slot => ({
        startTime: slot.time,
        endTime: undefined // endTime is optional in LoadedTimeSlot
      }))
      matchLoadedTimeSlots(
        transformedSlots,
        availableSlots,
        tempInspectorSlot,
        tempClientSlot
      )
      // Note: orderIndex matching will be handled in useAvailabilityUI when AppointmentSlots are available
    }
  }, { immediate: true })

  /**
   * Watch time slots and update selected date to today or first future availability
   * LEARNING: Auto-select today if it has slots, otherwise earliest future date
   * WHY: Always prefer today for testing time slot calculations, never use past dates
   * PATTERN: Watch timeSlots, prefer today over past dates
   * NOTE: Uses immediate: true to handle initial state
   *       The loadedWizardState watcher runs first and sets date to today, so this only runs if date is null
   */
  watch(timeSlots, (slots) => {
    // Only auto-select if no date is currently selected and we have slots
    if (!selectedDate.value.start && slots && slots.length > 0) {
      const today = getTodayDate()
      const firstDate = getFirstAvailabilityDate(slots)
      
      // LEARNING: Prefer today over past dates
      // WHY: For testing, we need to test time slot calculations for today/future, not past dates
      // PATTERN: Use today if it's >= firstDate, otherwise use firstDate (which should be today or future)
      const todayDate = new Date(today)
      const firstDateObj = firstDate ? new Date(firstDate) : null
      
      // Use today if it's today or future, otherwise use firstDate (which should be today or future)
      if (firstDate && firstDateObj && firstDateObj >= todayDate) {
        selectedDate.value = {
          start: firstDate,
          end: null
        }
      } else {
        // Fallback to today if firstDate is in the past or null
        selectedDate.value = {
          start: today,
          end: null
        }
      }
    }
  }, { immediate: true })

  /**
   * Watch isDifferentialService (now represents effective differential state) to auto-select startTimeType
   * LEARNING: Auto-selects 'nonDifferential' for non-differential services, 'major' for differential services
   * WHY: Ensures valid state is always selected and time slots are visible immediately. Step 3 starts in major view.
   * PATTERN: Watch isDifferentialService (which now represents effective differential state), set startTimeType accordingly
   * NOTE: isDifferentialService parameter now represents effective differential state (considering overrides)
   */
  watch(isDifferentialService, (isEffectivelyDifferential) => {
    if (!isEffectivelyDifferential) {
      // Non-differential services (or overridden to non-differential) always use 'nonDifferential'
      startTimeType.value = 'nonDifferential'
    } else {
      // Effectively differential services default to 'major' view (step 3 starts in major state)
      if (startTimeType.value === 'nonDifferential') {
        startTimeType.value = 'major'
      }
    }
  }, { immediate: true })

  return {
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex,
    inspectorOrderIndex,
    clientOrderIndex,
  }
}

