<!--
  WHY: Encapsulates constraints sub-tabs (range, capacity, overlap, rounding) for Business Controls.
  PATTERN: Injects shared state; owns sub-tab navigation and panel layout.
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from './businessControlsStateKey'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { DAY_NAMES } from '@/constants/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import RangeConstraintsPanel from './components/RangeConstraintsPanel.vue'
import CapacityConstraintsPanel from './components/CapacityConstraintsPanel.vue'
import OverlapConstraintsPanel from './components/OverlapConstraintsPanel.vue'
import DurationRoundingPanel from './components/DurationRoundingPanel.vue'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
const { currentTab: currentSubTab } = useTabNavigation({ initialTab: 'range' })

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const dayNames = DAY_NAMES

function handleDurationRoundingMethod(v: string): void {
  if (state?.formState?.durationRoundingMethod != null) {
    state.formState.durationRoundingMethod = v as 'roundUp' | 'roundDown' | 'roundNearest'
  }
}
</script>

<template>
  <div>
    <VTabs v-model="currentSubTab" class="mb-4">
      <VTab value="range">{{ UI_STRINGS.tabs.range }}</VTab>
      <VTab value="capacity">{{ UI_STRINGS.tabs.capacity }}</VTab>
      <VTab value="overlap">{{ UI_STRINGS.tabs.overlap }}</VTab>
      <VTab value="rounding">{{ UI_STRINGS.tabs.rounding }}</VTab>
    </VTabs>

    <VWindow v-model="currentSubTab">
      <VWindowItem key="range" value="range">
        <RangeConstraintsPanel
          v-if="state"
          :business-hours-for-ui="state.formState.businessHoursForUI"
          :update-business-hours="state.formState.updateBusinessHours"
          :day-names="dayNames"
          :range-constraints-lead-time-minutes="state.buffers.rangeConstraintsLeadTimeMinutes"
          :save-button-props="state.saveButtonProps"
          @update:range-constraints-lead-time-minutes="(v: number) => { state.buffers.rangeConstraintsLeadTimeMinutes = v }"
        />
      </VWindowItem>

      <VWindowItem key="capacity" value="capacity">
        <CapacityConstraintsPanel />
      </VWindowItem>

      <VWindowItem key="overlap" value="overlap">
        <OverlapConstraintsPanel />
      </VWindowItem>

      <VWindowItem key="rounding" value="rounding">
        <DurationRoundingPanel
          v-if="state?.formState"
          :duration-rounding-enabled="state.formState.durationRoundingEnabled"
          :duration-rounding-increment="state.formState.durationRoundingIncrement"
          :duration-rounding-method="state.formState.durationRoundingMethod"
          :save-button-props="state.saveButtonProps"
          @update:duration-rounding-enabled="(v: boolean) => { state.formState.durationRoundingEnabled = v }"
          @update:duration-rounding-increment="(v: number) => { state.formState.durationRoundingIncrement = v }"
          @update:duration-rounding-method="handleDurationRoundingMethod"
        />
      </VWindowItem>
    </VWindow>
  </div>
</template>
