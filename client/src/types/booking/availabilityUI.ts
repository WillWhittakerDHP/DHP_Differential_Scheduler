import type { Ref, ComputedRef } from 'vue'
import type { ISO8601Date } from '@shared/types/primitiveBrands'

export interface UseAvailabilityUIParams {
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
  selectedButtonIndex: Ref<number | null>
  fieldErrors: Ref<Record<string, string>>
}

export interface UseAvailabilityUIReturn {
  shouldShowGridInline: ComputedRef<boolean>
  handleDateChange: (value: string | Date | string[] | Date[] | null) => void
}
