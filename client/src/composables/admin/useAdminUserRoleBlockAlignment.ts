/**
 * Admin composable: persisted user_role → user-type block instance alignment (Feature 6.18.2.2).
 */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { USER_ROLE_VALUES, type UserRoleValue } from '@shared/constants/roleConstants'
import { getUserRoleBlockAlignment, putUserRoleBlockAlignment } from '@/configs/userRoleBlockAlignment/api'
import { createLogger } from '@/utils/logger'
import { useGlobal } from '@/composables/useGlobal'
import { getEligibleUserRoleAlignmentBlockInstances } from '@/utils/admin/eligibleUserRoleAlignmentBlockInstances'
import type { AdminSettingsTabQueryOptions } from '@/types/admin/adminSettingsTabQueryOptions'

const logger = createLogger('useAdminUserRoleBlockAlignment')

function createEmptyAlignmentsRecord(): Record<UserRoleValue, string | null> {
  return USER_ROLE_VALUES.reduce((acc, role) => {
    acc[role] = null
    return acc
  }, {} as Record<UserRoleValue, string | null>)
}

function mergeServerAlignments(
  server: Partial<Record<UserRoleValue, string | null>>
): Record<UserRoleValue, string | null> {
  const base = createEmptyAlignmentsRecord()
  for (const role of USER_ROLE_VALUES) {
    if (Object.prototype.hasOwnProperty.call(server, role)) {
      const v = server[role]
      base[role] = v === undefined ? null : v
    }
  }
  return base
}

export interface UseAdminUserRoleBlockAlignmentReturn {
  formData: Ref<Record<UserRoleValue, string | null> | null>
  eligibleInstanceSelectItems: ComputedRef<{ title: string; value: string }[]>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

export function useAdminUserRoleBlockAlignment(
  options?: AdminSettingsTabQueryOptions
): UseAdminUserRoleBlockAlignmentReturn {
  const { getGlobalData } = useGlobal()
  const formData = ref<Record<UserRoleValue, string | null> | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const eligibleInstanceSelectItems = computed(() => {
    const data = getGlobalData()
    if (data === null) {
      return []
    }
    const list = getEligibleUserRoleAlignmentBlockInstances(data)
    return [...list]
      .sort((a, b) => a.orderIndex - b.orderIndex || a.name.localeCompare(b.name))
      .map((bi) => ({ title: `${bi.name} (${bi.id})`, value: bi.id }))
  })

  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const server = await getUserRoleBlockAlignment()
      formData.value = mergeServerAlignments(server)
    } catch (err: unknown) {
      logger.error('Failed to load user role block alignment', { err })
      error.value = err instanceof Error ? err.message : 'Failed to load role alignment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (): Promise<void> => {
    error.value = null
    success.value = null
    if (formData.value === null) {
      error.value = 'Role alignment must be loaded before saving'
      return
    }
    saving.value = true
    try {
      await putUserRoleBlockAlignment({ alignments: formData.value })
      success.value = 'Role alignment saved.'
      setTimeout(() => {
        success.value = null
      }, 3000)
    } catch (err: unknown) {
      logger.error('Failed to save user role block alignment', { err })
      const axiosErr = err as { response?: { data?: { error?: string } } }
      error.value = axiosErr.response?.data?.error ?? 'Failed to save role alignment.'
    } finally {
      saving.value = false
    }
  }

  const enabled = options?.enabled
  if (enabled) {
    watch(
      enabled,
      (isEnabled) => {
        if (isEnabled && formData.value === null && !loading.value) {
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
    eligibleInstanceSelectItems,
    loading,
    saving,
    error,
    success,
    loadSettings,
    saveSettings,
  }
}
