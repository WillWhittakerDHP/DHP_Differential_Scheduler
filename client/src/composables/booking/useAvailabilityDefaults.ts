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
 * - Manage selectedDate, startTimeType, majorTimeSlot, minorTimeSlot state
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useTimeFormatting } from '@/composables/useTimeFormatting'
import { matchLoadedTimeSlots } from '@/utils/booking/timeSlotMatching'
import type { TimeSlot } from '@/types/appointment'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import { toISO8601Date } from '@/types/datetime'

export interface UseAvailabilityDefaultsOptions {
  loadedWizardState: Ref<WizardStateData | null>
  
  timeSlots: ComputedRef<TimeSlot[] | null>
  
  isDifferentialService: ComputedRef<boolean>
}

export interface UseAvailabilityDefaultsReturn {
  /**
   * Selected date state
   * LEARNING: Uses ISO 8601 date format (YYYY-MM-DD) for date-only values
   */
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  
  appointmentSlotOrderIndex: Ref<number | null>
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
  const selectedDate = ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>({ 
    start: toISO8601Date(getTodayDate()), 
    end: null 
  })

  /**
   * Start time type state
   * LEARNING: Tracks whether to show major or minor time slots
   * WHY: Differential services need separate major/minor views, non-differential always uses 'nonDifferential'
   * PATTERN: ref for string literal union type - 'nonDifferential' for non-differential services, 'major' | 'minor' for differential
   * NOTE: Defaults to 'major' so step 3 starts in major view
   */
  const startTimeType = ref<'major' | 'minor' | 'nonDifferential'>('major')

  /**
   * Per-date slot selection storage
   * LEARNING: Stores slot selections keyed by date string (ISO 8601)
   * WHY: Each day should remember its own slot selection independently
   * PATTERN: Internal map backing a writable computed for a clean public interface
   */
  const slotSelectionsByDate = ref<Record<string, number>>({})

  /**
   * Appointment slot order index (writable computed)
   * LEARNING: Reads/writes the slot selection for the current selectedDate
   * WHY: Consumers still see a simple Ref<number | null> but selections are per-date
   * PATTERN: Writable computed backed by a keyed record -- WritableComputedRef satisfies Ref<T>
   */
  const appointmentSlotOrderIndex = computed({
    get: (): number | null => {
      const currentDate = selectedDate.value.start
      if (!currentDate) return null
      return slotSelectionsByDate.value[currentDate] ?? null
    },
    set: (value: number | null) => {
      const currentDate = selectedDate.value.start
      if (!currentDate) return
      if (value === null) {
        const { [currentDate]: _, ...rest } = slotSelectionsByDate.value
        slotSelectionsByDate.value = rest
      } else {
        slotSelectionsByDate.value = { ...slotSelectionsByDate.value, [currentDate]: value }
      }
    }
  })

  /**
   * Watch loaded wizard state and reset selectedDate to today
   * LEARNING: When loading dummy appointments for testing, always use today's date
   * WHY: Dummy appointments shouldn't affect date selection - we're testing time slot calculations, not past dates
   * PATTERN: Reset selectedDate to today whenever an appointment is loaded
   * NOTE: This ensures we always calculate slots for today/future, not past dates
   */
  watch(loadedWizardState, () => {
    // PATTERN: Reset selectedDate to today whenever loadedWizardState changes
    const today = toISO8601Date(getTodayDate())
    if (selectedDate.value.start !== today) {
      selectedDate.value = {
        start: today,
        end: null
      }
    }
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
    if (newState?.availability?.candidateTimeSlots && 
        newState.availability.candidateTimeSlots.length > 0 &&
        availableSlots && 
        availableSlots.length > 0) {
      // Temporary: Use TimeSlot matching for now, will be updated to orderIndex matching
      // WHY: Transform selectedTimeSlots from { time, duration } format to { startTime, endTime } format
      const tempMajorSlot = ref<TimeSlot | null>(null)
      const tempMinorSlot = ref<TimeSlot | null>(null)
      const transformedSlots = newState.availability.candidateTimeSlots.map(slot => ({
        startTime: slot.time,
        endTime: undefined // endTime is optional in LoadedTimeSlot
      }))
      matchLoadedTimeSlots(
        transformedSlots,
        availableSlots,
        tempMajorSlot,
        tempMinorSlot
      )
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
    if (!selectedDate.value.start && slots && slots.length > 0) {
      const today = getTodayDate()
      const firstDate = getFirstAvailabilityDate(slots)
      
      // PATTERN: Use today if it's >= firstDate, otherwise use firstDate (which should be today or future)
      const todayDate = new Date(today)
      const firstDateObj = firstDate ? new Date(firstDate) : null
      
      if (firstDate && firstDateObj && firstDateObj >= todayDate) {
        selectedDate.value = {
          start: toISO8601Date(firstDate),
          end: null
        }
      } else {
        selectedDate.value = {
          start: toISO8601Date(today),
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
      startTimeType.value = 'nonDifferential'
    } else {
      if (startTimeType.value === 'nonDifferential') {
        startTimeType.value = 'major'
      }
    }
  }, { immediate: true })

  return {
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex,
  }
}

