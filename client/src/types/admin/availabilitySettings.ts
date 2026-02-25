import type { Ref } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'

export interface UseAvailabilitySettingsOptions {
  enabled?: Ref<boolean>
}

export interface UseAdminAvailabilitySettingsReturn {
  formData: Ref<AvailabilitySettings | null>
  autoConfirmEnabled: Ref<boolean>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  validateBusinessHours: () => boolean
  saveSettings: () => Promise<void>
}
