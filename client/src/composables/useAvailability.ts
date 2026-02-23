/**
 * useAvailability Composable
 *
 *
 * Phase 5/6: Server-Side Slot Computation — slot generation and constraint checks moved to server
 */

import { computed, ref, watch, type Ref, type ComputedRef, unref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { hasValidDateRangeStructure, validateDateRange } from '@/utils/booking/dateRangeValidation'
import type { PropertyDetails } from '@/types/availability'
import type { ComputedSlotAvailabilityData } from '@shared/types/availabilityTypes'

export function useAvailability(
  _blockInstances: BookingBlockInstance[] | Ref<BookingBlockInstance[]> | ComputedRef<BookingBlockInstance[]>,
  dateRange: { start: string | null; end: string | null } | null | Ref<{ start: string | null; end: string | null } | null> | ComputedRef<{ start: string | null; end: string | null } | null>,
  _propertyDetails?: PropertyDetails | null | Ref<PropertyDetails | null> | ComputedRef<PropertyDetails | null>,
  _prefetchedData?: Ref<ComputedSlotAvailabilityData | null> | ComputedRef<ComputedSlotAvailabilityData | null>
) {
  const timeSlots = ref<TimeSlot[]>([])
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const blockInstancesValue = computed(() => unref(_blockInstances))
  const dateRangeValue = computed(() => unref(dateRange))

  watch(
    [blockInstancesValue, dateRangeValue],
    () => {
      const blockInstances = blockInstancesValue.value
      const range = dateRangeValue.value
      if (!blockInstances || blockInstances.length === 0 || !hasValidDateRangeStructure(range)) {
        error.value = null
        isLoading.value = false
        timeSlots.value = []
        return
      }
      if (!validateDateRange(range)) {
        error.value = null
        isLoading.value = false
        timeSlots.value = []
        return
      }
      timeSlots.value = []
      error.value = null
      isLoading.value = false
    },
    { immediate: true }
  )

  return {
    timeSlots: computed(() => timeSlots.value),
    error: computed(() => error.value),
    hasError: computed(() => error.value !== null),
    isLoading: computed(() => isLoading.value),
  }
}
