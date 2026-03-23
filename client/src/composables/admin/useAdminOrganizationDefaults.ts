/**
 * Admin composable for organization_defaults (Phase 6.14).
 */
import { ref, watch, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'
import {
  getOrganizationDefaults,
  buildOrganizationDefaultsPayload,
} from '@/configs/organizationDefaults/api'
import apiClient from '@/utils/api'
import type { OrganizationDefaults } from '@shared/types/organizationDefaults'
import type { AdminSettingsTabQueryOptions } from '@/types/admin/adminSettingsTabQueryOptions'

const logger = createLogger('useAdminOrganizationDefaults')

export interface UseAdminOrganizationDefaultsReturn {
  formData: Ref<OrganizationDefaults | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

export function useAdminOrganizationDefaults(
  options?: AdminSettingsTabQueryOptions
): UseAdminOrganizationDefaultsReturn {
  const formData = ref<OrganizationDefaults | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      formData.value = await getOrganizationDefaults()
    } catch (err: unknown) {
      logger.error('Failed to load organization defaults', { err })
      error.value = err instanceof Error ? err.message : 'Failed to load organization defaults'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (): Promise<void> => {
    error.value = null
    success.value = null
    if (!formData.value) {
      error.value = 'Organization defaults must be loaded before saving'
      return
    }
    saving.value = true
    try {
      const payload = buildOrganizationDefaultsPayload(formData.value)
      await apiClient.put('/organization-defaults', payload)
      success.value = 'Organization defaults saved.'
      setTimeout(() => {
        success.value = null
      }, 3000)
    } catch (err: unknown) {
      logger.error('Failed to save organization defaults', { err })
      const axiosErr = err as { response?: { data?: { error?: string } } }
      error.value = axiosErr.response?.data?.error ?? 'Failed to save organization defaults.'
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
    saveSettings,
  }
}
