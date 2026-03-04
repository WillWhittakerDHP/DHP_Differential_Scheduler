<!--
  Grid config: slot increment, differential perspectives
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
  PATTERN: Injects businessControlsState from parent; handlers from useGridConfigHandlers
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { TIME_INCREMENT_OPTIONS } from '@/constants/availabilitySettings'
import { useGridConfigHandlers } from '@/composables/admin/useGridConfigHandlers'
import type { GridConfigState } from '@/types/admin/gridConfigHandlers'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!state) throw new Error('GridConfigPanel must be used inside BusinessControlsTab')

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const formState = state.formState
const differential = state.differential

const handlers = useGridConfigHandlers(state as GridConfigState)
</script>

<template>
  <div class="mb-6">
    <div class="text-body-large mb-3">{{ UI_STRINGS.sections.gridConfigTitle }}</div>

    <div class="mb-6">
      <div class="text-label-large mb-3">{{ UI_STRINGS.sections.slotIncrementTitle }}</div>
      <VSelect
        :model-value="formState.minuteIncrement"
        @update:model-value="handlers.handleMinuteIncrement"
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
        @update:model-value="handlers.handleMajorAttendees"
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
        @update:model-value="handlers.handleMajorLabel"
        :label="UI_STRINGS.differential.majorLabelLabel"
        :hint="UI_STRINGS.differential.majorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VSelect
        :model-value="differential.minorAttendees"
        @update:model-value="handlers.handleMinorAttendees"
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
        @update:model-value="handlers.handleMinorLabel"
        :label="UI_STRINGS.differential.minorLabelLabel"
        :hint="UI_STRINGS.differential.minorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.differentialGraphDefaultLabel"
        @update:model-value="handlers.handleDifferentialGraphDefaultLabel"
        :label="UI_STRINGS.differential.graphDefaultLabel"
        :hint="UI_STRINGS.differential.graphDefaultHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.moveableFallbackLabel"
        @update:model-value="handlers.handleMoveableFallbackLabel"
        :label="UI_STRINGS.differential.moveableFallbackLabel"
        :hint="UI_STRINGS.differential.moveableFallbackHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.majorStateLabel"
        @update:model-value="handlers.handleMajorStateLabel"
        :label="UI_STRINGS.differential.majorStateLabel"
        :hint="UI_STRINGS.differential.majorStateHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differential.minorStateLabel"
        @update:model-value="handlers.handleMinorStateLabel"
        :label="UI_STRINGS.differential.minorStateLabel"
        :hint="UI_STRINGS.differential.minorStateHint"
        persistent-hint
      />

      <div class="text-body-small mt-4 text-medium-emphasis">
        <div class="mb-1">{{ UI_STRINGS.differential.helpMajor }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpMinor }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpLabels }}</div>
        <div class="mb-1">{{ UI_STRINGS.differential.helpMoveableFallback }}</div>
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
