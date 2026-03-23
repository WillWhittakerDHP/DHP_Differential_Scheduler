import { ref } from 'vue'
import type { UseComputedAvailabilityParams, UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'
import { useComputedAvailabilityMutableState } from '@/composables/booking/useComputedAvailabilityState'
import { createComputedAvailabilityRangeFetcher } from '@/composables/booking/useComputedAvailabilityRangeFetcher'
import { resolveComputedAvailabilityDerived } from '@/composables/booking/useComputedAvailabilityDerived'
import { wireComputedAvailabilityWatchers } from '@/composables/booking/useComputedAvailabilityWiring'
import { createComputedAvailabilityAggregatedComputed } from '@/composables/booking/useComputedAvailabilityAggregatedComputed'

export function useComputedAvailability(
  params: UseComputedAvailabilityParams
): UseComputedAvailabilityReturn {
  const derived = resolveComputedAvailabilityDerived(params)
  const state = useComputedAvailabilityMutableState()
  const durationRef = params.duration ?? ref<number | null>(null)
  const fetchWithRange = createComputedAvailabilityRangeFetcher({
    fetchRefs: state.fetchRefs,
    placeId: derived.placeId,
    appointmentIdForRequest: derived.appointmentIdForRequest,
    durationRef,
    dataSource: params.dataSource,
  })

  wireComputedAvailabilityWatchers({
    activeStep: params.activeStep,
    placeId: derived.placeId,
    durationRef,
    appointmentIdForRequest: derived.appointmentIdForRequest,
    canFetchAvailability: derived.canFetchAvailability,
    clearSlotsCache: state.clearSlotsCache,
    fetchWithRange,
    dateRange: derived.dateRange,
    slotsByDay: state.refs.slotsByDay,
    selectedDate: params.selectedDate,
  })

  const computedData = createComputedAvailabilityAggregatedComputed(state)

  return {
    calendarEvents: state.refs.calendarEvents,
    slotsByDay: state.refs.slotsByDay,
    constraints: state.refs.constraints,
    computedData,
    isLoading: state.refs.isLoading,
    error: state.refs.error,
  }
}
