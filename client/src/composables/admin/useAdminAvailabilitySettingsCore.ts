import type { Ref } from 'vue'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import {
  getAvailabilitySettings,
  invalidateAvailabilitySettingsCache,
  validateBusinessHoursRange,
  buildAvailabilityPayload,
} from '@/configs/availabilitySettings'
import { applyAvailabilitySettingsLoadDefaults } from '@/utils/admin/availabilitySettingsLoadDefaults'

const logger = createLogger('useAdminAvailabilitySettingsCore')

export async function loadAdminAvailabilitySettingsIntoRefs(
  formData: Ref<AvailabilitySettings | null>,
  loading: Ref<boolean>,
  error: Ref<string | null>
): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const settings = await getAvailabilitySettings()
    applyAvailabilitySettingsLoadDefaults(settings)
    formData.value = settings
  } catch (err: unknown) {
    logger.error('Failed to load settings from API', { err })
    error.value = err instanceof Error ? err.message : 'Failed to load settings from API'
    throw err
  } finally {
    loading.value = false
  }
}

export function validateAdminAvailabilityBusinessHours(
  formData: Ref<AvailabilitySettings | null>,
  error: Ref<string | null>,
  rfc3339ToBusinessHoursHHmm: (rfc: RFC3339DateTime) => string
): boolean {
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

export async function saveAdminAvailabilitySettingsFromRefs(
  formData: Ref<AvailabilitySettings | null>,
  saving: Ref<boolean>,
  error: Ref<string | null>,
  success: Ref<string | null>,
  rfc3339ToBusinessHoursHHmm: (rfc: RFC3339DateTime) => string
): Promise<void> {
  error.value = null
  success.value = null

  if (!formData.value) {
    error.value = 'Settings must be loaded before saving'
    return
  }

  if (!validateAdminAvailabilityBusinessHours(formData, error, rfc3339ToBusinessHoursHHmm)) {
    return
  }

  saving.value = true
  try {
    const payload = buildAvailabilityPayload(formData.value)
    await apiClient.put('/business-settings/availability_settings', payload)
    invalidateAvailabilitySettingsCache()

    success.value = 'Settings saved successfully!'
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: unknown) {
    logger.error('Failed to save availability settings', { err })
    const axiosErr = err as { response?: { data?: { error?: string } } }
    const errMsg = axiosErr.response?.data?.error
    error.value =
      errMsg !== undefined && errMsg !== null && errMsg !== '' ? errMsg : 'Failed to save settings. Please try again.'
  } finally {
    saving.value = false
  }
}
