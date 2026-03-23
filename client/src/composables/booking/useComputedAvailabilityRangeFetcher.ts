import type { ComputedRef, Ref } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import {
  fetchComputedAvailabilityForRange,
  type ComputedAvailabilityFetchRefs,
} from '@/composables/booking/computedAvailabilityFetchCore'

interface ComputedAvailabilityRangeFetcherDeps {
  fetchRefs: ComputedAvailabilityFetchRefs
  placeId: ComputedRef<string | undefined>
  appointmentIdForRequest: ComputedRef<string | null>
  durationRef: Ref<number | null>
  dataSource?: Ref<'real' | 'mock' | 'none'>
}

export function createComputedAvailabilityRangeFetcher(
  deps: ComputedAvailabilityRangeFetcherDeps
): (range: { start: RFC3339DateTime; end: RFC3339DateTime }, label: string) => Promise<void> {
  const { fetchRefs, placeId, appointmentIdForRequest, durationRef, dataSource } = deps

  return async (
    range: { start: RFC3339DateTime; end: RFC3339DateTime },
    label: string
  ): Promise<void> => {
    const rawDuration = durationRef.value
    const currentDuration = rawDuration !== undefined && rawDuration !== null ? rawDuration : 60
    await fetchComputedAvailabilityForRange(fetchRefs, range, label, {
      placeId: placeId.value,
      appointmentId: appointmentIdForRequest.value,
      duration: currentDuration,
      dataSource: dataSource?.value ?? 'real',
    })
  }
}
