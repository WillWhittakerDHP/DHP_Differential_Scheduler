import type { ComputedRef, Ref } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { ComputedSlot } from '@shared/types/availabilityTypes'
import {
  setupComputedAvailabilityMonthPrefetchWatch,
  setupComputedAvailabilityPerDayWatch,
  setupComputedAvailabilityPrefetchWatch,
} from '@/composables/booking/useComputedAvailabilityWatches'

interface WireComputedAvailabilityWatchersInput {
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
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  slotsByDay: Ref<Map<string, ComputedSlot[]>>
  selectedDate?: Ref<string | null>
}

/** Registers prefetch, month, and optional per-day watchers for computed availability. */
export function wireComputedAvailabilityWatchers(input: WireComputedAvailabilityWatchersInput): void {
  const {
    activeStep,
    placeId,
    durationRef,
    appointmentIdForRequest,
    canFetchAvailability,
    clearSlotsCache,
    fetchWithRange,
    dateRange,
    slotsByDay,
    selectedDate,
  } = input

  setupComputedAvailabilityPrefetchWatch({
    activeStep,
    placeId,
    durationRef,
    appointmentIdForRequest,
    canFetchAvailability,
    clearSlotsCache,
    fetchWithRange,
  })

  setupComputedAvailabilityMonthPrefetchWatch({
    dateRange,
    canFetchAvailability,
    slotsByDay,
    fetchWithRange,
  })

  if (selectedDate) {
    setupComputedAvailabilityPerDayWatch({
      selectedDate,
      canFetchAvailability,
      slotsByDay,
      fetchWithRange,
    })
  }
}
