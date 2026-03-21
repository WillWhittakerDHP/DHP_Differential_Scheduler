/**
 * Admin composable for availability settings (constraints, buffers, capacity). Calendar and wizard use separate composables.
 */
import { ref, watch } from 'vue'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { DEFAULT_DRIVE_TIME_FEE_CONFIG } from '@/utils/booking/computeDriveTimeFee'
import {
  getAvailabilitySettings,
  invalidateAvailabilitySettingsCache,
  validateBusinessHoursRange,
  buildAvailabilityPayload,
} from '@/configs/availabilitySettings'
import { localTime } from '@/utils/time/localTime'
import type { UseAdminAvailabilitySettingsReturn, UseAvailabilitySettingsOptions } from '@/types/admin/availabilitySettings'

const logger = createLogger('useAdminAvailabilitySettings')

export function calculateMaxBusinessHours(businessHours: AvailabilitySettings['businessHours']): number {
  const { rfc3339ToBusinessHoursHHmm } = localTime()
  return Math.max(
    ...Object.values(businessHours).map(day => {
      const startTimeStr = rfc3339ToBusinessHoursHHmm(day.start)
      const endTimeStr = rfc3339ToBusinessHoursHHmm(day.end)
      const [startHour, startMin] = startTimeStr.split(':').map(Number)
      const [endHour, endMin] = endTimeStr.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return (endMinutes - startMinutes) / 60
    })
  )
}

export function useAdminAvailabilitySettings(options?: UseAvailabilitySettingsOptions): UseAdminAvailabilitySettingsReturn {
  const formData = ref<AvailabilitySettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const { rfc3339ToBusinessHoursHHmm } = localTime()

  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const settings = await getAvailabilitySettings()
      if (!settings.durationRounding) {
        settings.durationRounding = {
          enabled: false,
          increment: settings.minuteIncrement || 15,
          method: 'roundUp' as const,
        }
      }
      if (!settings.driveTimeFee) {
        settings.driveTimeFee = { ...DEFAULT_DRIVE_TIME_FEE_CONFIG }
      }
      formData.value = settings
    } catch (err: unknown) {
      logger.error('Failed to load settings from API', { err })
      error.value = err instanceof Error ? err.message : 'Failed to load settings from API'
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateBusinessHours = (): boolean => {
    if (!formData.value) {
      error.value = 'Settings must be loaded before validation'
      return false
    }
    const result = validateBusinessHoursRange(formData.value.businessHours, rfc3339ToBusinessHoursHHmm)
    if (!result.valid) {
      error.value = result.errorMessage ?? 'Invalid business hours'
    }
    return result.valid
  }

  const saveSettings = async (): Promise<void> => {
    error.value = null
    success.value = null

    if (!formData.value) {
      error.value = 'Settings must be loaded before saving'
      return
    }

    if (!validateBusinessHours()) {
      return
    }

    saving.value = true

    try {
      const payload = buildAvailabilityPayload(formData.value)
      await apiClient.put('/business-settings/availability_settings', payload)
      invalidateAvailabilitySettingsCache()

      success.value = 'Settings saved successfully!'
      setTimeout(() => { success.value = null }, 3000)
    } catch (err: unknown) {
      logger.error('Failed to save availability settings', { err })
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const errMsg = axiosErr.response?.data?.error
      error.value = errMsg !== undefined && errMsg !== null && errMsg !== '' ? errMsg : 'Failed to save settings. Please try again.'
    } finally {
      saving.value = false
    }
  }

  const enabled = options?.enabled
  if (enabled) {
    watch(
      enabled,
      (isEnabled) => {
        if (isEnabled && !formData.value && !loading.value) {
          loadSettings()
        }
      },
      { immediate: true }
    )
  } else {
    loadSettings()
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
