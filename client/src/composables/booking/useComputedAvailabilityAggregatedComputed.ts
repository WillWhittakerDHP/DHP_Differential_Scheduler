import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ComputedSlotAvailabilityData } from '@shared/types/availabilityTypes'
import { buildComputedSlotAvailabilityData } from '@/composables/booking/computedAvailabilityFetchCore'
import type { ComputedAvailabilityMutableBundle } from '@/composables/booking/useComputedAvailabilityMutableState'

export function createComputedAvailabilityAggregatedComputed(
  state: ComputedAvailabilityMutableBundle
): ComputedRef<ComputedSlotAvailabilityData | null> {
  return computed<ComputedSlotAvailabilityData | null>(() =>
    buildComputedSlotAvailabilityData(
      state.refs.slotsByDay.value,
      state.refs.constraints.value,
      state.refs.minuteIncrement.value,
      state.refs.timezone.value,
      state.refs.durationRounding.value,
      state.refs.calendarEvents.value,
      state.refs.outOfOfficeEvents.value,
      state.refs.computedDataMeta.value
    )
  )
}
