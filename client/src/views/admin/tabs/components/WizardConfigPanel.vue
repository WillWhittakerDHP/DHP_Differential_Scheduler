<!--
  WHY: Wizard-specific settings consolidated in one tab (task 6.10.5).
  PATTERN: Injects BUSINESS_CONTROLS_STATE_KEY; uses state.wizardSettings.flags and state.differential (sub-step labels).
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { useGridConfigHandlers } from '@/utils/admin/gridConfigHandlers'
import type { GridConfigState } from '@/types/admin/gridConfigHandlers'
import WizardBrandPanel from './WizardBrandPanel.vue'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const handlers = state ? useGridConfigHandlers(state as GridConfigState) : null
const differential = state?.differential

function handleShowApplyCoupon(value: boolean | null): void {
  state?.wizardSettings?.flags.setShowApplyCoupon(value === true)
}

function handleUseBrandColors(value: boolean | null): void {
  state?.wizardSettings?.flags.setUseBrandColors(value === true)
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
      :model-value="state.wizardSettings.flags.showApplyCoupon"
      @update:model-value="handleShowApplyCoupon"
      :label="UI_STRINGS.calendar.showApplyCouponLabel"
      :hint="UI_STRINGS.calendar.showApplyCouponHint"
      persistent-hint
      class="mb-4"
    />
    <VSwitch
      v-if="state?.wizardSettings"
      :model-value="state.wizardSettings.flags.useBrandColors"
      @update:model-value="handleUseBrandColors"
      :label="UI_STRINGS.calendar.useBrandColorsLabel"
      :hint="UI_STRINGS.calendar.useBrandColorsHint"
      persistent-hint
      class="mb-4"
    />

    <WizardBrandPanel />

    <VDivider v-if="state?.differential && handlers" class="my-6" />

    <div v-if="differential && handlers" class="mb-6">
      <div class="text-label-large mb-3">{{ UI_STRINGS.differential.subStepLabelsSectionTitle }}</div>
      <div class="text-body-small mb-4 text-medium-emphasis">
        {{ UI_STRINGS.differential.subStepLabelsSectionHint }}
      </div>
      <VTextField
        :model-value="differential.subStepLabelPickDay"
        @update:model-value="handlers.handleSubStepLabelPickDay"
        :label="UI_STRINGS.differential.subStepLabelPickDay"
        :hint="UI_STRINGS.differential.subStepLabelPickDayHint"
        persistent-hint
        class="mb-4"
      />
      <VTextField
        :model-value="differential.subStepLabelOptions"
        @update:model-value="handlers.handleSubStepLabelOptions"
        :label="UI_STRINGS.differential.subStepLabelOptions"
        :hint="UI_STRINGS.differential.subStepLabelOptionsHint"
        persistent-hint
        class="mb-4"
      />
      <VTextField
        :model-value="differential.subStepLabelPickTime"
        @update:model-value="handlers.handleSubStepLabelPickTime"
        :label="UI_STRINGS.differential.subStepLabelPickTime"
        :hint="UI_STRINGS.differential.subStepLabelPickTimeHint"
        persistent-hint
        class="mb-4"
      />
      <VTextField
        :model-value="differential.subStepLabelConfirmMinimizer"
        @update:model-value="handlers.handleSubStepLabelConfirmMinimizer"
        :label="UI_STRINGS.differential.subStepLabelConfirmMinimizer"
        :hint="UI_STRINGS.differential.subStepLabelConfirmMinimizerHint"
        persistent-hint
        class="mb-4"
      />
      <VTextField
        :model-value="differential.minimizerNoFeasibleCompletionSlotsMessage"
        @update:model-value="handlers.handleMinimizerNoFeasibleCompletionSlotsMessage"
        :label="UI_STRINGS.differential.minimizerNoFeasibleCompletionSlotsMessage"
        :hint="UI_STRINGS.differential.minimizerNoFeasibleCompletionSlotsMessageHint"
        persistent-hint
        class="mb-4"
      />
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn
        v-if="state?.wizardSaveButtonProps"
        v-bind="state.wizardSaveButtonProps"
      >
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
