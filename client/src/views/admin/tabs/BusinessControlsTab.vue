<!--
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration; delegates to panel components and composables
-->
<script setup lang="ts">
import { computed, inject, provide, reactive, type Ref } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from './businessControlsStateKey'
import { useAdminAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAdminAvailabilitySettings'
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

const {
  formData,
  autoConfirmEnabled,
  loading,
  saving,
  error,
  success,
  saveSettings
} = useAdminAvailabilitySettings({
  enabled: isTabActive
})

const formStateGrouped = useBusinessControlsFormState({
  formData,
  saving,
  error,
  autoConfirmEnabled
})
const formState = {
  ...formStateGrouped.businessHours,
  ...formStateGrouped.calendar,
  ...formStateGrouped.rounding,
}
const { clearError, saveButtonProps } = formStateGrouped.calendar

const wizardSettings = useWizardSettings({
  showApplyCouponInWizardBinding: formStateGrouped.calendar.showApplyCouponInWizard,
})

const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })

const maxBusinessHours = computed(() => {
  if (!formData.value) return 0
  return calculateMaxBusinessHours(formData.value.businessHours)
})

const capacity = useCapacitySettings({ formData, maxBusinessHours })
const buffers = useBufferSettings({ formData } as UseBufferSettingsParams)
const location = useDefaultLocation({ formData } as UseDefaultLocationParams)
const differential = useDifferentialPerspectives({ formData } as UseDifferentialPerspectivesParams)

const businessControlsState = reactive({
  formState,
  wizardSettings,
  capacity,
  buffers,
  location,
  differential,
  saveButtonProps,
  autoConfirmEnabled
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

    <VForm v-else @submit.prevent="saveSettings">
      <VAlert v-if="success" type="success" dismissible class="mb-4">
        {{ success }}
      </VAlert>
      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="clearError"
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
