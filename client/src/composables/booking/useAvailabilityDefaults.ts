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

import { ref, watch, type Ref, type ComputedRef } from 'vue'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { matchLoadedTimeSlots } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

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
   */
  selectedDate: Ref<{ start: string | null; end: string | null }>
  
  /**
   * Start time type (inspector, client, or null for neither selected)
   */
  startTimeType: Ref<'inspector' | 'client' | null>
  
  /**
   * Inspector time slot
   */
  inspectorTimeSlot: Ref<TimeSlot | null>
  
  /**
   * Client time slot
   */
  clientTimeSlot: Ref<TimeSlot | null>
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
 * - Manages selectedDate, startTimeType, inspectorTimeSlot, clientTimeSlot state
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
   * LEARNING: Tracks whether to show inspector or client time slots
   * WHY: Differential services need separate inspector/client views
   * PATTERN: ref for string literal union type with null for "neither selected" state
   * USER_STORY: Both buttons Active by default (neither Selected), toggle between Selected/Active
   */
  const startTimeType = ref<'inspector' | 'client' | null>(null)

  /**
   * Inspector time slot state
   * LEARNING: Tracks selected inspector time slot
   * WHY: Need reactive state for time slot selection
   * PATTERN: ref for TimeSlot or null
   */
  const inspectorTimeSlot = ref<TimeSlot | null>(null)

  /**
   * Client time slot state
   * LEARNING: Tracks selected client time slot
   * WHY: Need reactive state for time slot selection
   * PATTERN: ref for TimeSlot or null
   */
  const clientTimeSlot = ref<TimeSlot | null>(null)

  /**
   * Watch loaded wizard state for time slot matching (but don't set date)
   * LEARNING: Enables matching loaded time slots to available slots for validation
   * WHY: When appointment is loaded, we want to match time slots but not override the date
   * PATTERN: Watch loadedWizardState but only use it for time slot matching, not date setting
   * NOTE: Date is initialized to today and managed by user selection, not loaded from appointments
   */
  watch(loadedWizardState, () => {
    // Don't set date from loaded appointments - let user select date or use today's default
    // Time slot matching happens in the next watcher below
  }, { immediate: true })

  /**
   * Watch both loaded wizard state and time slots to populate time slot selections
   * LEARNING: Enables validation to pass when appointment is loaded with time slots
   * WHY: When appointment is loaded, match time slots from appointment to available slots
   * PATTERN: Use helper function to match loaded time slots
   */
  watch([loadedWizardState, timeSlots], ([newState, availableSlots]) => {
    if (newState?.availability?.selectedTimeSlots && 
        newState.availability.selectedTimeSlots.length > 0 &&
        availableSlots && 
        availableSlots.length > 0) {
      matchLoadedTimeSlots(
        newState.availability.selectedTimeSlots,
        availableSlots,
        inspectorTimeSlot,
        clientTimeSlot
      )
    }
  }, { immediate: true })

  /**
   * Watch time slots and update selected date to first availability if no date selected
   * LEARNING: Auto-select earliest available date when time slots load
   * WHY: Provides better UX by auto-selecting first available date
   * PATTERN: Watch timeSlots, update selectedDate if not set
   * NOTE: Uses immediate: true to handle initial state, but only sets if no date is selected
   *       The loadedWizardState watcher runs first (immediate: true) and may populate date,
   *       so this watcher respects that by checking if date is already set
   */
  watch(timeSlots, (slots) => {
    // Only auto-select if no date is currently selected and we have slots
    // The loadedWizardState watcher will have already run (immediate: true) and populated from loadedWizardState if available
    if (!selectedDate.value.start && slots && slots.length > 0) {
      const firstDate = getFirstAvailabilityDate(slots)
      if (firstDate) {
        selectedDate.value = {
          start: firstDate,
          end: null
        }
      }
    }
  }, { immediate: true })

  /**
   * Watch isDifferentialService to auto-select startTimeType for differential services
   * LEARNING: Auto-selects 'client' view when differential service is detected
   * WHY: Ensures time slots are visible immediately for differential services without requiring manual button click
   * PATTERN: Watch isDifferentialService, set startTimeType to 'client' when service is differential and no selection exists
   */
  watch(isDifferentialService, (isDifferential) => {
    if (isDifferential && startTimeType.value === null) {
      startTimeType.value = 'client'
    }
  }, { immediate: true })

  return {
    selectedDate,
    startTimeType,
    inspectorTimeSlot,
    clientTimeSlot,
  }
}

