/**
 * Admin composable for availability settings (constraints, buffers, capacity). Calendar and wizard use separate composables.
 */
import { ref, watch } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { useLocalTime } from '@/utils/time/localTime'
import type { AdminSettingsTabQueryOptions } from '@/types/admin/adminSettingsTabQueryOptions'
import type { UseAdminAvailabilitySettingsReturn } from '@/types/admin/availabilitySettings'
import { maxBusinessHoursFromWeeklySchedule } from '@/utils/admin/businessHoursMaxSpan'
import {
  loadAdminAvailabilitySettingsIntoRefs,
  saveAdminAvailabilitySettingsFromRefs,
  validateAdminAvailabilityBusinessHours,
} from '@/composables/admin/useAdminAvailabilitySettingsCore'

export function calculateMaxBusinessHours(
  businessHours: AvailabilitySettings['businessHours'],
  rfc3339ToBusinessHoursHHmm: (rfc: RFC3339DateTime) => string
): number {
  return maxBusinessHoursFromWeeklySchedule(businessHours, rfc3339ToBusinessHoursHHmm)
}

export function useAdminAvailabilitySettings(options?: AdminSettingsTabQueryOptions): UseAdminAvailabilitySettingsReturn {
  const formData = ref<AvailabilitySettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const { rfc3339ToBusinessHoursHHmm } = useLocalTime()

  const loadSettings = async (): Promise<void> => {
    await loadAdminAvailabilitySettingsIntoRefs(formData, loading, error)
  }

  const validateBusinessHours = (): boolean =>
    validateAdminAvailabilityBusinessHours(formData, error, rfc3339ToBusinessHoursHHmm)

  const saveSettings = async (): Promise<void> => {
    await saveAdminAvailabilitySettingsFromRefs(formData, saving, error, success, rfc3339ToBusinessHoursHHmm)
  }

  const enabled = options?.enabled
  if (enabled) {
    watch(
      enabled,
      (isEnabled) => {
        if (isEnabled && !formData.value && !loading.value) {
          void loadSettings()
        }
      },
      { immediate: true }
    )
  } else {
    void loadSettings()
  }

  return {
    formData,
    loading,
    saving,
    error,
    success,
    loadSettings,
    validateBusinessHours,
    saveSettings,
  }
}
