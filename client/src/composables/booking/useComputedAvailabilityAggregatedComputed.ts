import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ComputedSlotAvailabilityData } from '@shared/types/availabilityTypes'
import { buildComputedSlotAvailabilityData } from '@/composables/booking/computedAvailabilityFetchCore'
import type { ComputedAvailabilityMutableBundle } from '@/composables/booking/useComputedAvailabilityState'

export function createComputedAvailabilityAggregatedComputed(
  state: ComputedAvailabilityMutableBundle
): ComputedRef<ComputedSlotAvailabilityData | null> {
  return computed<ComputedSlotAvailabilityData | null>(() =>
    buildComputedSlotAvailabilityData(
      state.slotsByDay.value,
      state.constraints.value,
      state.minuteIncrement.value,
      state.timezone.value,
      state.durationRounding.value,
      state.calendarEvents.value,
      state.outOfOfficeEvents.value,
      state.computedDataMeta.value
    )
  )
}
