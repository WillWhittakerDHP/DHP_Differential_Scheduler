<!--
  WHY: Wizard-specific settings (e.g. show Apply Coupon in wizard) consolidated in one tab.
  PATTERN: Injects BUSINESS_CONTROLS_STATE_KEY; uses state.wizardSettings from useWizardSettings (task 6.10.5.1).
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

function handleShowApplyCoupon(value: boolean | null): void {
  state?.wizardSettings?.setShowApplyCouponInWizard(value === true)
}
</script>

<template>
  <div class="mb-6">
    <div class="text-body-large mb-3">{{ UI_STRINGS.tabs.wizard }}</div>
    <div class="text-body-medium mb-4 text-medium-emphasis">
      Settings that affect the booking wizard (summary, fee preview, coupon visibility).
    </div>

    <VSwitch
      v-if="state?.wizardSettings"
      :model-value="state.wizardSettings.showApplyCouponInWizard"
      @update:model-value="handleShowApplyCoupon"
      :label="UI_STRINGS.calendar.showApplyCouponLabel"
      :hint="UI_STRINGS.calendar.showApplyCouponHint"
      persistent-hint
      class="mb-4"
    />

    <div class="d-flex gap-2 mt-4">
      <VBtn v-if="state?.saveButtonProps" v-bind="state.saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
