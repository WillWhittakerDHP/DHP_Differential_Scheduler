/**
 * Admin composable for calendar_settings (calendar integration + auto-confirm).
 */
import { ref, watch } from 'vue'
import { createLogger } from '@/utils/logger'
import { getCalendarSettings, buildCalendarPayload } from '@/configs/calendarSettings'
import apiClient from '@/utils/api'
import type { AdminSettingsTabQueryOptions } from '@/types/admin/adminSettingsTabQueryOptions'
import type { UseAdminCalendarSettingsReturn } from '@/types/admin/calendarSettings'

const logger = createLogger('useAdminCalendarSettings')

export function useAdminCalendarSettings(options?: AdminSettingsTabQueryOptions): UseAdminCalendarSettingsReturn {
  const formData = ref<import('@/configs/calendarSettings').CalendarSettingsData | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await getCalendarSettings()
      formData.value = data
    } catch (err: unknown) {
      logger.error('Failed to load calendar settings', { err })
      error.value = err instanceof Error ? err.message : 'Failed to load calendar settings'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (): Promise<void> => {
    error.value = null
    success.value = null
    if (!formData.value) {
      error.value = 'Calendar settings must be loaded before saving'
      return
    }
    saving.value = true
    try {
      const payload = buildCalendarPayload(formData.value)
      await apiClient.put('/calendar-settings', payload)
      success.value = 'Calendar settings saved.'
      setTimeout(() => { success.value = null }, 3000)
    } catch (err: unknown) {
      logger.error('Failed to save calendar settings', { err })
      const axiosErr = err as { response?: { data?: { error?: string } } }
      error.value = axiosErr.response?.data?.error ?? 'Failed to save calendar settings.'
    } finally {
      saving.value = false
    }
  }

  const enabled = options?.enabled
  if (enabled) {
    watch(enabled, (isEnabled) => {
      if (isEnabled && !formData.value && !loading.value) loadSettings()
    }, { immediate: true })
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
    saveSettings,
  }
}
