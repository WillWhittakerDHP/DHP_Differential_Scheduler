<!--
  Grid config: slot increment, differential perspectives
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { TIME_INCREMENT_OPTIONS } from '@/constants/availabilitySettings'
import type { GlobalEntityId } from '@/types/entities'

defineProps<{
  minuteIncrement: number
  majorAttendees: GlobalEntityId[]
  minorAttendees: GlobalEntityId[]
  majorLabel: string
  minorLabel: string
  differentialGraphDefaultLabel: string
  majorStateLabel: string
  minorStateLabel: string
  availableUserTypeBlocks: Array<{ id: GlobalEntityId; title: string; value: GlobalEntityId }>
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:minuteIncrement': [value: number]
  'update:majorAttendees': [value: GlobalEntityId[]]
  'update:minorAttendees': [value: GlobalEntityId[]]
  'update:majorLabel': [value: string]
  'update:minorLabel': [value: string]
  'update:differentialGraphDefaultLabel': [value: string]
  'update:majorStateLabel': [value: string]
  'update:minorStateLabel': [value: string]
}>()

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
</script>

<template>
  <div class="mb-6">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.sections.gridConfigTitle }}</div>

    <div class="mb-6">
      <div class="text-subtitle-2 mb-3">{{ UI_STRINGS.sections.slotIncrementTitle }}</div>
      <VSelect
        :model-value="minuteIncrement"
        @update:model-value="(v: number | string) => emit('update:minuteIncrement', Number(v))"
        :items="timeIncrementOptions"
        :label="UI_STRINGS.labels.timeSlotIncrement"
        required
        :rules="[(v: number) => !!v || UI_STRINGS.validation.timeIncrementRequired]"
        class="mb-2"
      />
      <div class="text-caption">
        {{ UI_STRINGS.help.timeSlots }} {{ minuteIncrement }} minutes
      </div>
    </div>

    <VDivider class="my-6" />

    <div class="mb-6">
      <div class="text-subtitle-2 mb-3">{{ UI_STRINGS.differential.sectionTitle }}</div>
      <div class="text-body-2 mb-4 text-medium-emphasis">
        {{ UI_STRINGS.differential.sectionDescription }}
      </div>

      <VSelect
        :model-value="majorAttendees"
        @update:model-value="emit('update:majorAttendees', $event)"
        :items="availableUserTypeBlocks"
        :label="UI_STRINGS.differential.majorAttendeesLabel"
        :hint="UI_STRINGS.differential.majorAttendeesHint"
        persistent-hint
        multiple
        chips
        closable-chips
        class="mb-4"
      />

      <VTextField
        :model-value="majorLabel"
        @update:model-value="emit('update:majorLabel', $event)"
        :label="UI_STRINGS.differential.majorLabelLabel"
        :hint="UI_STRINGS.differential.majorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VSelect
        :model-value="minorAttendees"
        @update:model-value="emit('update:minorAttendees', $event)"
        :items="availableUserTypeBlocks"
        :label="UI_STRINGS.differential.minorAttendeesLabel"
        :hint="UI_STRINGS.differential.minorAttendeesHint"
        persistent-hint
        multiple
        chips
        closable-chips
        class="mb-4"
      />

      <VTextField
        :model-value="minorLabel"
        @update:model-value="emit('update:minorLabel', $event)"
        :label="UI_STRINGS.differential.minorLabelLabel"
        :hint="UI_STRINGS.differential.minorLabelHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="differentialGraphDefaultLabel"
        @update:model-value="emit('update:differentialGraphDefaultLabel', $event)"
        :label="UI_STRINGS.differential.graphDefaultLabel"
        :hint="UI_STRINGS.differential.graphDefaultHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="majorStateLabel"
        @update:model-value="emit('update:majorStateLabel', $event)"
        :label="UI_STRINGS.differential.majorStateLabel"
        :hint="UI_STRINGS.differential.majorStateHint"
        persistent-hint
        class="mb-4"
      />

      <VTextField
        :model-value="minorStateLabel"
        @update:model-value="emit('update:minorStateLabel', $event)"
        :label="UI_STRINGS.differential.minorStateLabel"
        :hint="UI_STRINGS.differential.minorStateHint"
        persistent-hint
      />

      <div class="text-caption mt-4 text-medium-emphasis">
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
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
