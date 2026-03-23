/**
 * PATTERN: useAvailabilityDefaults Composable

PATTERN: Composable that manages sel...
 */
import { ref, computed, watch, type Ref } from 'vue'
import { getFirstAvailabilityDate, getTodayDate } from '@/utils/time/timeFormatting'
import { matchLoadedTimeSlots } from '@/composables/booking/useTimeSlotMatching'
import type { TimeSlot } from '@/types/appointment'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { UseAvailabilityDefaultsOptions, UseAvailabilityDefaultsReturn } from '@/types/booking/availabilityDefaults'
import {
  initialAvailabilityDateRangeFromRestore,
  resolveAvailabilityDateWhenNoneSelected,
} from '@/utils/booking/availabilityDefaultsDatePick'
import { computeSlotRestoreUpdate } from '@/utils/booking/availabilityDefaultsSlotRestore'
import {
  wizardCandidateSlotsToLoadedSlots,
  type WizardCandidateTimeSlotPersisted,
} from '@/utils/booking/availabilityDefaultsTimeSlotTransform'

interface WizardStateLike {
  availability?: { candidateTimeSlots?: WizardCandidateTimeSlotPersisted[] }
}

function runSlotRestoreWatch(
  restoreVal: unknown,
  slots: unknown,
  date: unknown,
  slotSelectionsByDate: Ref<Record<string, number>>,
  restoreState: { done: boolean }
): void {
  const slotList: TimeSlot[] = (slots as TimeSlot[] | null | undefined) ?? []
  const dateStart = (date as { start: string | null })?.start ?? null
  const update = computeSlotRestoreUpdate(restoreVal, slotList, dateStart)
  if (!restoreState.done && update) {
    slotSelectionsByDate.value = { ...slotSelectionsByDate.value, [update.dateKey]: update.index }
    restoreState.done = true
  }
}

function runResetDateOnWizardLoad(
  restoreFrom: UseAvailabilityDefaultsOptions['restoreFrom'],
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
): void {
  if (restoreFrom?.value?.candidateDate?.start) {
    return
  }
  const today = getTodayDate()
  if (selectedDate.value.start !== today) {
    selectedDate.value = { start: today, end: null }
  }
}

function runLoadedStateTimeMatchWatch(
  newState: unknown,
  availableSlots: unknown,
  tempMajorSlot: Ref<TimeSlot | null>,
  tempMinorSlot: Ref<TimeSlot | null>
): void {
  const state = newState as WizardStateLike | null
  const slots = (availableSlots as TimeSlot[] | null | undefined) ?? []
  const candidate = state?.availability?.candidateTimeSlots
  if (!candidate || candidate.length === 0 || slots.length === 0) {
    return
  }
  const transformedSlots = wizardCandidateSlotsToLoadedSlots(candidate)
  matchLoadedTimeSlots(transformedSlots, slots, tempMajorSlot, tempMinorSlot)
}

/**
 * WHY: useAvailabilityDefaults composable
WHY: Centralizes defaulting logic and...
 */
export function useAvailabilityDefaults(options: UseAvailabilityDefaultsOptions): UseAvailabilityDefaultsReturn {
  const { loadedWizardState, timeSlots, isDifferentialService, restoreFrom } = options

  const getInitialDate = (): { start: ISO8601Date | null; end: ISO8601Date | null } =>
    initialAvailabilityDateRangeFromRestore(restoreFrom?.value?.candidateDate, getTodayDate())
  const selectedDate = ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>(getInitialDate())

  const startTimeType = ref<'major' | 'minor' | 'nonDifferential'>('major')

  const slotSelectionsByDate = ref<Record<string, number>>({})

  const tempMajorSlot = ref<TimeSlot | null>(null)
  const tempMinorSlot = ref<TimeSlot | null>(null)

  const appointmentSlotOrderIndex = computed({
    get: (): number | null => {
      const currentDate = selectedDate.value.start
      if (!currentDate) {
        return null
      }
      return slotSelectionsByDate.value[currentDate] ?? null
    },
    set: (value: number | null) => {
      const currentDate = selectedDate.value.start
      if (!currentDate) {
        return
      }
      if (value === null) {
        const { [currentDate]: _, ...rest } = slotSelectionsByDate.value
        slotSelectionsByDate.value = rest
      } else {
        slotSelectionsByDate.value = { ...slotSelectionsByDate.value, [currentDate]: value }
      }
    },
  })

  const slotRestoreState = { done: false }
  watch(
    [() => restoreFrom?.value, timeSlots, selectedDate],
    ([restoreVal, slots, date]) => {
      runSlotRestoreWatch(restoreVal, slots, date, slotSelectionsByDate, slotRestoreState)
    },
    { immediate: true }
  )

  watch(
    loadedWizardState,
    () => {
      runResetDateOnWizardLoad(restoreFrom, selectedDate)
    },
    { immediate: true }
  )

  watch(
    [loadedWizardState, timeSlots],
    ([newState, availableSlots]) => {
      runLoadedStateTimeMatchWatch(newState, availableSlots, tempMajorSlot, tempMinorSlot)
    },
    { immediate: true }
  )

  watch(
    timeSlots,
    (slots) => {
      if (!selectedDate.value.start && slots && slots.length > 0) {
        const todayIso = getTodayDate()
        const firstDate = getFirstAvailabilityDate(slots)
        selectedDate.value = resolveAvailabilityDateWhenNoneSelected(firstDate, todayIso)
      }
    },
    { immediate: true }
  )

  watch(
    isDifferentialService,
    (isEffectivelyDifferential) => {
      if (!isEffectivelyDifferential) {
        startTimeType.value = 'nonDifferential'
      } else if (startTimeType.value === 'nonDifferential') {
        startTimeType.value = 'major'
      }
    },
    { immediate: true }
  )

  return {
    selectedDate,
    startTimeType,
    appointmentSlotOrderIndex,
  }
}
