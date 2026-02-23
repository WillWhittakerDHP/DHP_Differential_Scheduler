/**
 * PATTERN: useAvailabilityDefaults Composable

PATTERN: Composable that manages sel...
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
   * WHY: /**
Selected date state
LEARNING: Uses ISO 8601 date format (YYYY-MM-DD)...
   */
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  
  appointmentSlotOrderIndex: Ref<number | null>
}

/**
 * WHY: useAvailabilityDefaults composable
WHY: Centralizes defaulting logic and...
 */
export function useAvailabilityDefaults(options: UseAvailabilityDefaultsOptions): UseAvailabilityDefaultsReturn {
  const { loadedWizardState, timeSlots, isDifferentialService } = options
  const { getFirstAvailabilityDate, getTodayDate } = useTimeFormatting()

  /**
   * WHY: /**
Selected date state
WHY: Need reactive state for date selection
FIX:...
   */
  const selectedDate = ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>({ 
    start: toISO8601Date(getTodayDate()), 
    end: null 
  })

  /**
   * Start time type state
   * NOTE: Defaults to 'major' so step 3 starts in major view
   */
  const startTimeType = ref<'major' | 'minor' | 'nonDifferential'>('major')

  /**
   * WHY: /**
Per-date slot selection storage
LEARNING: Stores slot selections key...
   */
  const slotSelectionsByDate = ref<Record<string, number>>({})

  /**
   * Appointment slot order index (writable computed)
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
   * PATTERN: /**
Watch isDifferentialService (now represents effective differential s...
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

