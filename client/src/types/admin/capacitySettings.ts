import type { ComputedRef, Ref } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

export interface UseCapacitySettingsParams {
  formData: Ref<AvailabilitySettings | null>
  maxBusinessHours: ComputedRef<number>
}
