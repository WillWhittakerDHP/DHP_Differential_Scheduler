import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { UseComputedAvailabilityParams } from '@/types/booking/computedAvailability'

interface ComputedAvailabilityDerived {
  dateRange: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime }>
  placeId: ComputedRef<string | undefined>
  canFetchAvailability: ComputedRef<boolean>
  appointmentIdForRequest: ComputedRef<string | null>
}

export function resolveComputedAvailabilityDerived(params: UseComputedAvailabilityParams): ComputedAvailabilityDerived {
  const { propertyDetailsStepData, dateRange, appointmentId } = params

  const placeId = computed(() => propertyDetailsStepData.value?.candidatePlaceId)
  const canFetchAvailability = computed(() => !!dateRange.value?.start && !!dateRange.value?.end)
  const appointmentIdForRequest = computed(() => appointmentId?.value ?? null)

  return {
    dateRange,
    placeId,
    canFetchAvailability,
    appointmentIdForRequest,
  }
}
