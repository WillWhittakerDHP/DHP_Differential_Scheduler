/**
 * Business Controls tab: wires availability, calendar, wizard settings, constraints UI, and provide().
 * WHY: Keeps the view thin (component-logic); orchestration lives in one composable.
 */
import { computed, inject, provide, reactive, type ComputedRef, type Ref } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '@/views/admin/tabs/businessControlsStateKey'
import { useAdminAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAdminAvailabilitySettings'
import { useLocalTime } from '@/utils/time/localTime'
import { useAdminCalendarSettings } from '@/composables/admin/useAdminCalendarSettings'
import { useAdminWizardSettings } from '@/composables/admin/useAdminWizardSettings'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { useBusinessControlsFormState } from '@/composables/admin/useBusinessControlsFormState'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import { useCapacitySettings } from '@/composables/admin/useCapacitySettings'
import { useBufferSettings } from '@/composables/admin/useBufferSettings'
import { useDefaultLocation } from '@/composables/admin/useDefaultLocation'
import { useDifferentialPerspectives } from '@/composables/admin/useDifferentialPerspectives'
import type {
  UseBufferSettingsParams,
  UseDefaultLocationParams,
  UseDifferentialPerspectivesParams,
} from '@/types/availabilitySettingsParams'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { adminCurrentTabKey } from '@/types/admin/adminInjectionKeys'
import type { BusinessControlsState } from '@/types/admin/businessControlsState'

export interface UseBusinessControlsTabReturn {
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  success: ComputedRef<string | null>
  handleSave: () => Promise<void>
  clearAllErrors: () => void
  currentMainTab: Ref<string>
  businessControlsState: BusinessControlsState
  UI_STRINGS: typeof BUSINESS_CONTROLS_TAB_STRINGS
}

export function useBusinessControlsTab(): UseBusinessControlsTabReturn {
  const adminCurrentTab = inject<Ref<string> | undefined>(adminCurrentTabKey)
  const isTabActive = computed(() => adminCurrentTab?.value === 'business')
  const { rfc3339ToBusinessHoursHHmm } = useLocalTime()

  const availability = useAdminAvailabilitySettings({ enabled: isTabActive })
  const calendar = useAdminCalendarSettings({ enabled: isTabActive })
  const wizard = useAdminWizardSettings({ enabled: isTabActive })

  const formStateGrouped = useBusinessControlsFormState({
    formData: availability.formData,
    saving: availability.saving,
    error: availability.error,
    calendarFormData: calendar.formData,
    calendarSaving: calendar.saving,
    calendarError: calendar.error,
    wizardFormData: wizard.formData,
  })

  const formState = {
    ...formStateGrouped.businessHours,
    ...formStateGrouped.calendar,
    ...formStateGrouped.rounding,
  }
  const { saveButtonProps } = formStateGrouped.calendar

  const showApplyCouponBinding = computed({
    get: () => wizard.formData.value?.showApplyCoupon ?? false,
    set: (v: boolean) => {
      if (wizard.formData.value) wizard.formData.value.showApplyCoupon = v
    },
  })
  const useBrandColorsBinding = computed({
    get: () => wizard.formData.value?.useBrandColors ?? false,
    set: (v: boolean) => {
      if (wizard.formData.value) wizard.formData.value.useBrandColors = v
    },
  })

  const wizardSettings = useWizardSettings({
    showApplyCouponBinding,
    useBrandColorsBinding,
  })

  const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })

  const loading = computed(() => availability.loading.value || calendar.loading.value || wizard.loading.value)
  const error = computed(() => availability.error.value ?? calendar.error.value ?? wizard.error.value)
  const success = computed(() => availability.success.value ?? calendar.success.value ?? wizard.success.value)

  async function handleSave(): Promise<void> {
    if (currentMainTab.value === 'constraints') {
      await availability.saveSettings()
    } else if (currentMainTab.value === 'calendar') {
      await calendar.saveSettings()
      await availability.saveSettings()
      if (wizard.formData.value) {
        await wizard.saveSettings()
      }
    } else if (currentMainTab.value === 'wizard') {
      await wizard.saveSettings()
    }
  }

  function clearAllErrors(): void {
    availability.error.value = null
    calendar.error.value = null
    wizard.error.value = null
  }

  const maxBusinessHours = computed(() => {
    if (!availability.formData.value) {
      return 0
    }
    return calculateMaxBusinessHours(
      availability.formData.value.businessHours,
      rfc3339ToBusinessHoursHHmm
    )
  })

  // @audit-allow:hardcoding:fieldMapping - composable factory wiring (formData + deps), not row/column maps
  const capacity = useCapacitySettings({ formData: availability.formData, maxBusinessHours })
  // @audit-allow:hardcoding:fieldMapping - composable factory wiring (formData + deps), not row/column maps
  const buffers = useBufferSettings({ formData: availability.formData } as UseBufferSettingsParams)
  // @audit-allow:hardcoding:fieldMapping - composable factory wiring (formData + deps), not row/column maps
  const location = useDefaultLocation({ formData: availability.formData } as UseDefaultLocationParams)
  const differential = useDifferentialPerspectives({
    formData: availability.formData,
    wizardFormData: wizard.formData,
    __brand: 'UseDifferentialPerspectivesParams',
  } as UseDifferentialPerspectivesParams)

  const businessControlsState = reactive({
    formState,
    availabilityFormData: availability.formData,
    wizardSettings,
    capacity,
    buffers,
    location,
    differential,
    saveButtonProps,
    autoConfirmEnabled: formStateGrouped.calendar.autoConfirmEnabled,
    calendarSaveSettings: calendar.saveSettings,
    wizardSaveSettings: wizard.saveSettings,
    constraintsSaveButtonProps: computed(() => ({
      type: 'submit' as const,
      color: 'primary' as const,
      loading: availability.saving.value,
      disabled: availability.saving.value,
    })),
    calendarSaveButtonProps: formStateGrouped.calendar.saveButtonProps,
    wizardSaveButtonProps: computed(() => ({
      type: 'submit' as const,
      color: 'primary' as const,
      loading: wizard.saving.value,
      disabled: wizard.saving.value,
    })),
  })

  provide(BUSINESS_CONTROLS_STATE_KEY, businessControlsState)

  return {
    loading,
    error,
    success,
    handleSave,
    clearAllErrors,
    currentMainTab,
    businessControlsState: businessControlsState as BusinessControlsState,
    UI_STRINGS: BUSINESS_CONTROLS_TAB_STRINGS,
  }
}
