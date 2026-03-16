<!--
  WHY: Admin config for availability (constraints), calendar, wizard. Each sub-tab loads/saves its own settings.
-->
<script setup lang="ts">
import { computed, inject, provide, reactive, type Ref } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from './businessControlsStateKey'
import { useAdminAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAdminAvailabilitySettings'
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
  UseDifferentialPerspectivesParams
} from '@/types/availabilitySettingsParams'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import BusinessControlsConstraintsSection from './BusinessControlsConstraintsSection.vue'
import BusinessControlsCalendarSection from './BusinessControlsCalendarSection.vue'
import WizardConfigPanel from './components/WizardConfigPanel.vue'
import BusinessControlsRulesSection from './BusinessControlsRulesSection.vue'

const adminCurrentTab = inject<Ref<string>>('adminCurrentTab')
const isTabActive = computed(() => adminCurrentTab?.value === 'business')

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

function handleSave(): void {
  if (currentMainTab.value === 'constraints') void availability.saveSettings()
  else if (currentMainTab.value === 'calendar') void calendar.saveSettings()
  else if (currentMainTab.value === 'wizard') void wizard.saveSettings()
}

function clearAllErrors(): void {
  availability.error.value = null
  calendar.error.value = null
  wizard.error.value = null
}

const maxBusinessHours = computed(() => {
  if (!availability.formData.value) return 0
  return calculateMaxBusinessHours(availability.formData.value.businessHours)
})

const capacity = useCapacitySettings({ formData: availability.formData, maxBusinessHours })
const buffers = useBufferSettings({ formData: availability.formData } as UseBufferSettingsParams)
const location = useDefaultLocation({ formData: availability.formData } as UseDefaultLocationParams)
const differential = useDifferentialPerspectives({
  formData: availability.formData,
  wizardFormData: wizard.formData,
  __brand: 'UseDifferentialPerspectivesParams',
} as UseDifferentialPerspectivesParams)

const businessControlsState = reactive({
  formState,
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

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
</script>

<template>
  <div class="business-controls-tab">
    <div v-if="loading" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">{{ UI_STRINGS.loading }}</div>
    </div>

    <VForm v-else @submit.prevent="handleSave">
      <VAlert v-if="success" type="success" dismissible class="mb-4">
        {{ success }}
      </VAlert>
      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="clearAllErrors"
      >
        {{ error }}
      </VAlert>

      <VTabs v-model="currentMainTab" class="mb-4">
        <VTab value="constraints">{{ UI_STRINGS.tabs.constraints }}</VTab>
        <VTab value="calendar">{{ UI_STRINGS.tabs.calendar }}</VTab>
        <VTab value="wizard">{{ UI_STRINGS.tabs.wizard }}</VTab>
        <VTab value="rules">{{ UI_STRINGS.tabs.rules }}</VTab>
      </VTabs>

      <VWindow v-model="currentMainTab">
        <VWindowItem key="constraints" value="constraints">
          <BusinessControlsConstraintsSection />
        </VWindowItem>

        <VWindowItem key="calendar" value="calendar">
          <BusinessControlsCalendarSection />
        </VWindowItem>

        <VWindowItem key="wizard" value="wizard">
          <WizardConfigPanel v-if="businessControlsState?.wizardSettings" />
        </VWindowItem>

        <VWindowItem key="rules" value="rules">
          <BusinessControlsRulesSection />
        </VWindowItem>
      </VWindow>
    </VForm>
  </div>
</template>

<style scoped>
.business-controls-tab {
  padding: 1rem;
}
</style>
