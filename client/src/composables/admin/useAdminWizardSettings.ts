/**
 * Admin composable for wizard_settings (wizard display: coupon, brand colors, labels).
 */
import { ref, watch } from 'vue'
import { createLogger } from '@/utils/logger'
import { getWizardSettings, buildWizardPayload } from '@/configs/wizardSettings'
import apiClient from '@/utils/api'
import type { AdminSettingsTabQueryOptions } from '@/types/admin/adminSettingsTabQueryOptions'
import type { UseAdminWizardSettingsReturn } from '@/types/admin/wizardSettings'

const logger = createLogger('useAdminWizardSettings')

export function useAdminWizardSettings(options?: AdminSettingsTabQueryOptions): UseAdminWizardSettingsReturn {
  const formData = ref<import('@/configs/wizardSettings').WizardSettingsData | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      formData.value = await getWizardSettings()
    } catch (err: unknown) {
      logger.error('Failed to load wizard settings', { err })
      error.value = err instanceof Error ? err.message : 'Failed to load wizard settings'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (): Promise<void> => {
    error.value = null
    success.value = null
    if (!formData.value) {
      error.value = 'Wizard settings must be loaded before saving'
      return
    }
    saving.value = true
    try {
      await apiClient.put('/wizard-settings', buildWizardPayload(formData.value))
      success.value = 'Wizard settings saved.'
      setTimeout(() => { success.value = null }, 3000)
    } catch (err: unknown) {
      logger.error('Failed to save wizard settings', { err })
      const axiosErr = err as { response?: { data?: { error?: string } } }
      error.value = axiosErr.response?.data?.error ?? 'Failed to save wizard settings.'
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
