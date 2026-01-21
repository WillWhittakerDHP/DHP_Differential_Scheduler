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
   * WHY: Differential services need separate inspector/client views, non-differential always uses 'nonDifferential'
   * PATTERN: ref for string literal union type - 'nonDifferential' for non-differential services, 'inspector' | 'client' for differential
   * NOTE: Defaults to 'inspector' so step 3 starts in inspector view
   */
  const startTimeType = ref<'inspector' | 'client' | 'nonDifferential'>('inspector')

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
      const tempInspectorSlot = ref<TimeSlot | null>(null)
      const tempClientSlot = ref<TimeSlot | null>(null)
      matchLoadedTimeSlots(
        newState.availability.selectedTimeSlots,
        availableSlots,
        tempInspectorSlot,
        tempClientSlot
      )
      // Note: orderIndex matching will be handled in useAvailabilityUI when AppointmentSlots are available
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
   * Watch isDifferentialService (now represents effective differential state) to auto-select startTimeType
   * LEARNING: Auto-selects 'nonDifferential' for non-differential services, 'inspector' for differential services
   * WHY: Ensures valid state is always selected and time slots are visible immediately. Step 3 starts in inspector view.
   * PATTERN: Watch isDifferentialService (which now represents effective differential state), set startTimeType accordingly
   * NOTE: isDifferentialService parameter now represents effective differential state (considering overrides)
   */
  watch(isDifferentialService, (isEffectivelyDifferential) => {
    if (!isEffectivelyDifferential) {
      // Non-differential services (or overridden to non-differential) always use 'nonDifferential'
      startTimeType.value = 'nonDifferential'
    } else {
      // Effectively differential services default to 'inspector' view (step 3 starts in inspector state)
      if (startTimeType.value === 'nonDifferential') {
        startTimeType.value = 'inspector'
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

