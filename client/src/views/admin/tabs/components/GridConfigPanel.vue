<!--
  Grid config: slot increment, differential perspectives
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
  PATTERN: Injects businessControlsState from parent to avoid prop/emit drilling
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { TIME_INCREMENT_OPTIONS } from '@/constants/availabilitySettings'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!state) throw new Error('GridConfigPanel must be used inside BusinessControlsTab')

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const formState = state.formState
const differential = state.differential

function handleMinuteIncrement(v: number | string): void {
  formState.setMinuteIncrement(Number(v))
}
function handleMajorAttendees(v: unknown): void {
  differential.majorAttendees = v as typeof differential.majorAttendees
}
function handleMinorAttendees(v: unknown): void {
  differential.minorAttendees = v as typeof differential.minorAttendees
}
function handleMajorLabel(v: string): void {
  differential.majorLabel = v
}
function handleMinorLabel(v: string): void {
  differential.minorLabel = v
}
function handleDifferentialGraphDefaultLabel(v: string): void {
  differential.differentialGraphDefaultLabel = v
}
function handleMajorStateLabel(v: string): void {
  differential.majorStateLabel = v
}
function handleMinorStateLabel(v: string): void {
  differential.minorStateLabel = v
}
</script>

<template>
  <div class="mb-6">
    <div class="text-body-large mb-3">{{ UI_STRINGS.sections.gridConfigTitle }}</div>

    <div class="mb-6">
      <div class="text-label-large mb-3">{{ UI_STRINGS.sections.slotIncrementTitle }}</div>
      <VSelect
        :model-value="formState.minuteIncrement"
        @update:model-value="handleMinuteIncrement"
        :items="timeIncrementOptions"
        :label="UI_STRINGS.labels.timeSlotIncrement"
        required
        :rules="[(v: number) => !!v || UI_STRINGS.validation.timeIncrementRequired]"
        class="mb-2"
      />
      <div class="text-body-small">
        {{ UI_STRINGS.help.timeSlots }} {{ formState.minuteIncrement }} minutes
      </div>
    </div>

    <VDivider class="my-6" />

    <div class="mb-6">
      <div class="text-label-large mb-3">{{ UI_STRINGS.differential.sectionTitle }}</div>
      <div class="text-body-medium mb-4 text-medium-emphasis">
        {{ UI_STRINGS.differential.sectionDescription }}
      </div>

      <VSelect
        :model-value="differential.majorAttendees"
        @update:model-value="handleMajorAttendees"
        :items="differential.availableUserTypeBlocks"
        :label="UI_STRINGS.differential.majorAttendeesLabel"
        :hint="UI_STRINGS.differential.majorAttendeesHint"
        persistent-hint
        multiple
        chips
        closable-chips
        class="mb-4"
      />

      <VTextField
        :model-value="differential.majorLabel"
        @update:model-value="handleMajorLabel"
        :label="UI_STRINGS.differential.majorLabelLabel"
        :hint="UI_STRINGS.differential.majorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VSelect
        :model-value="differential.minorAttendees"
        @update:model-value="handleMinorAttendees"
        :items="differential.availableUserTypeBlocks"
        :label="UI_STRINGS.differential.minorAttendeesLabel"
        :hint="UI_STRINGS.differential.minorAttendeesHint"
        persistent-hint
        multiple
        chips
        closable-chips
        class="mb-4"
      />

      <VTextField
        :model-value="differential.minorLabel"
        @update:model-value="handleMinorLabel"
        :label="UI_STRINGS.differential.minorLabelLabel"
        :hint="UI_STRINGS.differential.minorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.differentialGraphDefaultLabel"
        @update:model-value="handleDifferentialGraphDefaultLabel"
        :label="UI_STRINGS.differential.graphDefaultLabel"
        :hint="UI_STRINGS.differential.graphDefaultHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.majorStateLabel"
        @update:model-value="handleMajorStateLabel"
        :label="UI_STRINGS.differential.majorStateLabel"
        :hint="UI_STRINGS.differential.majorStateHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.minorStateLabel"
        @update:model-value="handleMinorStateLabel"
        :label="UI_STRINGS.differential.minorStateLabel"
        :hint="UI_STRINGS.differential.minorStateHint"
        persistent-hint
      />

      <div class="text-body-small mt-4 text-medium-emphasis">
        <div class="mb-1">{{ UI_STRINGS.differential.helpMajor }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpMinor }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpLabels }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpGraphDefault }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpStateLabels }}</div>
        <div>{{ UI_STRINGS.differential.helpFallback }}</div>
      </div>
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="state.saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
