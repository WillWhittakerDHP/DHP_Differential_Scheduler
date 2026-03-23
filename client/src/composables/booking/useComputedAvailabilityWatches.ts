import type { ComputedRef, Ref } from 'vue'
import { ref, watch } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import { getPrefetchDateRange, perDayRangeAroundUtcDate } from '@/composables/booking/computedAvailabilityFetchCore'

interface ComputedAvailabilityPrefetchWatchDeps {
  activeStep: Ref<number>
  placeId: ComputedRef<string | undefined>
  durationRef: Ref<number | null>
  appointmentIdForRequest: ComputedRef<string | null>
  canFetchAvailability: ComputedRef<boolean>
  clearSlotsCache: () => void
  fetchWithRange: (
    range: { start: RFC3339DateTime; end: RFC3339DateTime },
    label: string
  ) => Promise<void>
}

/** Clears slot cache when place / appointment / duration identity changes, then prefetches a 14-day range. */
export function setupComputedAvailabilityPrefetchWatch(deps: ComputedAvailabilityPrefetchWatchDeps): void {
  const {
    activeStep,
    placeId,
    durationRef,
    appointmentIdForRequest,
    canFetchAvailability,
    clearSlotsCache,
    fetchWithRange,
  } = deps

  const lastPlaceId = ref<string | undefined>(undefined)
  const lastAppointmentId = ref<string | undefined>(undefined)
  const lastDuration = ref<number>(60)

  watch(
    [activeStep, placeId, durationRef, appointmentIdForRequest],
    () => {
      if (!canFetchAvailability.value) return

      const pid = placeId.value
      const aptId = appointmentIdForRequest.value ?? undefined
      const rawDur = durationRef.value
      const dur = rawDur !== undefined && rawDur !== null ? rawDur : 60
      if (
        lastPlaceId.value !== pid ||
        lastDuration.value !== dur ||
        lastAppointmentId.value !== aptId
      ) {
        clearSlotsCache()
        lastPlaceId.value = pid
        lastDuration.value = dur
        lastAppointmentId.value = aptId
      }

      void fetchWithRange(getPrefetchDateRange(), 'prefetch')
    },
    { immediate: true }
  )
}

interface ComputedAvailabilityMonthPrefetchWatchDeps {
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  canFetchAvailability: ComputedRef<boolean>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  fetchWithRange: (
    range: { start: RFC3339DateTime; end: RFC3339DateTime },
    label: string
  ) => Promise<void>
}

/** Fetches month-end slice when the visible calendar range changes and that day is not yet cached. */
export function setupComputedAvailabilityMonthPrefetchWatch(deps: ComputedAvailabilityMonthPrefetchWatchDeps): void {
  const { dateRange, canFetchAvailability, slotsByDay, fetchWithRange } = deps

  watch(dateRange, (newRange) => {
    if (!canFetchAvailability.value) return
    const monthEndDay = newRange.end.slice(0, 10)
    if (slotsByDay.value.has(monthEndDay)) return
    void fetchWithRange(newRange, 'month-prefetch')
  })
}

interface ComputedAvailabilityPerDayWatchDeps {
  selectedDate: Ref<string | null>
  canFetchAvailability: ComputedRef<boolean>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  fetchWithRange: (
    range: { start: RFC3339DateTime; end: RFC3339DateTime },
    label: string
  ) => Promise<void>
}

/** When a single day is selected, fetches a narrow range around that UTC date if missing from cache. */
export function setupComputedAvailabilityPerDayWatch(deps: ComputedAvailabilityPerDayWatchDeps): void {
  const { selectedDate, canFetchAvailability, slotsByDay, fetchWithRange } = deps

  watch(
    selectedDate,
    (day) => {
      if (!day || !canFetchAvailability.value) return
      if (slotsByDay.value.has(day)) return
      void fetchWithRange(perDayRangeAroundUtcDate(day), 'per-day')
    },
    { immediate: true }
  )
}
