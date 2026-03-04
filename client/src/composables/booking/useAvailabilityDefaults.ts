/**
 * PATTERN: useAvailabilityDefaults Composable

PATTERN: Composable that manages sel...
 */
import { ref, computed, watch } from 'vue'
import { getFirstAvailabilityDate, getTodayDate } from '@/utils/time/timeFormatting'
import { matchLoadedTimeSlots } from '@/composables/booking/useTimeSlotMatching'
import { findMatchingTimeSlot } from '@/utils/booking/timeSlotMatching'
import { toISO8601Date } from '@/utils/datetime'
import type { TimeSlot } from '@/types/appointment'
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { UseAvailabilityDefaultsOptions, UseAvailabilityDefaultsReturn } from '@/types/booking/availabilityDefaults'

/**
 * WHY: useAvailabilityDefaults composable
WHY: Centralizes defaulting logic and...
 */
export function useAvailabilityDefaults(options: UseAvailabilityDefaultsOptions): UseAvailabilityDefaultsReturn {
  const { loadedWizardState, timeSlots, isDifferentialService, restoreFrom } = options

  /**
Selected date state
WHY: Need reactive state for date selection
FIX: Restore from parent availabilityStepData when returning to step (wizard persistence).
   */
  const getInitialDate = (): { start: ISO8601Date | null; end: ISO8601Date | null } => {
    const restored = restoreFrom?.value?.candidateDate
    if (restored?.start) {
      const start = restored.start.includes('T') ? restored.start.split('T')[0] : restored.start
      return { start: start as ISO8601Date, end: (restored.end as ISO8601Date | null) ?? null }
    }
    return { start: toISO8601Date(getTodayDate()), end: null }
  }
  const selectedDate = ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>(getInitialDate())

  /**
   * Start time type state
   * NOTE: Defaults to 'major' so step 3 starts in major view
   */
  const startTimeType = ref<'major' | 'minor' | 'nonDifferential'>('major')

  /**
Per-date slot selection storage
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
   * Restore slot selection from parent when returning to step (wizard persistence).
   * Runs when restoreFrom has candidateTimeSlots and timeSlots are available.
   */
  let slotRestored = false
  watch(
    [() => restoreFrom?.value, timeSlots, selectedDate],
    ([restoreVal, slots, date]) => {
      const data = restoreVal as { candidateTimeSlots?: Array<{ startTime: string }> } | null | undefined
      const slotList = (slots as TimeSlot[] | null) ?? []
      const dateStart = (date as { start: string | null })?.start
      if (!slotRestored && data?.candidateTimeSlots?.length && slotList.length && dateStart) {
        const firstSlot = data.candidateTimeSlots[0]
        const matched = findMatchingTimeSlot(firstSlot.startTime, slotList)
        if (matched) {
          const buttonIndex = slotList.indexOf(matched)
          if (buttonIndex >= 0) {
            slotSelectionsByDate.value = { ...slotSelectionsByDate.value, [dateStart]: buttonIndex }
            slotRestored = true
          }
        }
      }
    },
    { immediate: true }
  )

  /**
   * Watch loaded wizard state and reset selectedDate to today
   * NOTE: This ensures we always calculate slots for today/future, not past dates.
   * Skip when restoring from parent (wizard persistence) so we don't overwrite restored date.
   */
  watch(loadedWizardState, () => {
    if (restoreFrom?.value?.candidateDate?.start) return
    const today = toISO8601Date(getTodayDate())
    if (selectedDate.value.start !== today) {
      selectedDate.value = {
        start: today,
        end: null
      }
    }
  }, { immediate: true })

  /**
   * Watch both loaded wizard state and time slots to populate order index selections.
   * NOTE: TimeSlot matching is used; orderIndex-based matching is deferred until AppointmentSlots support it.
   */
  watch([loadedWizardState, timeSlots], ([newState, availableSlots]) => {
    if (newState?.availability?.candidateTimeSlots &&
        newState.availability.candidateTimeSlots.length > 0 &&
        availableSlots &&
        availableSlots.length > 0) {
      // WHY: Transform selectedTimeSlots from { time, duration } format to { startTime, endTime } format
      const tempMajorSlot = ref<TimeSlot | null>(null)
      const tempMinorSlot = ref<TimeSlot | null>(null)
      const transformedSlots = newState.availability.candidateTimeSlots.map(slot => ({
        startTime: slot.time as RFC3339DateTime,
        endTime: undefined
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
