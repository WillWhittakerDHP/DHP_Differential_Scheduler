/**
 * Aggregated load/save/error state and tab-keyed save orchestration for Business Controls.
 * WHY: Keeps useBusinessControlsTab under composables-logic thresholds (extract async branches + awaits).
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { UseAdminAvailabilitySettingsReturn } from '@/types/admin/availabilitySettings'
import type { UseAdminCalendarSettingsReturn } from '@/types/admin/calendarSettings'
import type { UseAdminWizardSettingsReturn } from '@/types/admin/wizardSettings'
import type { UseAdminOrganizationDefaultsReturn } from '@/composables/admin/useAdminOrganizationDefaults'

export interface UseBusinessControlsTabSaveAndStatusDeps {
  currentMainTab: Ref<string>
  availability: UseAdminAvailabilitySettingsReturn
  calendar: UseAdminCalendarSettingsReturn
  wizard: UseAdminWizardSettingsReturn
  organization: UseAdminOrganizationDefaultsReturn
}

export interface UseBusinessControlsTabSaveAndStatusReturn {
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  success: ComputedRef<string | null>
  handleSave: () => Promise<void>
  clearAllErrors: () => void
}

export function useBusinessControlsTabSaveAndStatus(
  deps: UseBusinessControlsTabSaveAndStatusDeps
): UseBusinessControlsTabSaveAndStatusReturn {
  const { currentMainTab, availability, calendar, wizard, organization } = deps

  const loading = computed(
    () =>
      availability.loading.value ||
      calendar.loading.value ||
      wizard.loading.value ||
      organization.loading.value
  )

  const error = computed(
    () =>
      availability.error.value ??
      calendar.error.value ??
      wizard.error.value ??
      organization.error.value
  )

  const success = computed(
    () =>
      availability.success.value ??
      calendar.success.value ??
      wizard.success.value ??
      organization.success.value
  )

  async function handleSave(): Promise<void> {
    const tab = currentMainTab.value
    if (tab === 'constraints') {
      await availability.saveSettings()
      return
    }
    if (tab === 'calendar') {
      await calendar.saveSettings()
      await availability.saveSettings()
      if (wizard.formData.value) {
        await wizard.saveSettings()
      }
      return
    }
    if (tab === 'wizard') {
      await wizard.saveSettings()
      return
    }
    if (tab === 'organization') {
      await organization.saveSettings()
    }
  }

  function clearAllErrors(): void {
    availability.error.value = null
    calendar.error.value = null
    wizard.error.value = null
    organization.error.value = null
  }

  return {
    loading,
    error,
    success,
    handleSave,
    clearAllErrors,
  }
}
