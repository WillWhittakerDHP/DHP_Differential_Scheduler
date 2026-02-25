import type { ComputedRef, Ref } from 'vue'

export interface UseAvailabilityEmptyStateParams {
  isEffectivelyDifferential: ComputedRef<boolean>
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
  appointmentSlotsCount: ComputedRef<number>
}

export interface UseAvailabilityEmptyStateReturn {
  emptyStateMessage: ComputedRef<string | null>
}
