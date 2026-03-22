import type { Ref, ComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

export interface UseBookingAvailabilitySettingsReturn {
  settings: ComputedRef<AvailabilitySettings | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  hasError: ComputedRef<boolean>
  refresh: () => Promise<void>
}
