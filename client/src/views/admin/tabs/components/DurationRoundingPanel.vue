<!--
  Duration rounding: enable, increment, method
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ROUNDING_INCREMENT_OPTIONS,
  ROUNDING_METHOD_OPTIONS
} from '@/constants/businessControlsOptions'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

defineProps<{
  durationRoundingEnabled: boolean
  durationRoundingIncrement: number
  durationRoundingMethod: string
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:durationRoundingEnabled': [value: boolean]
  'update:durationRoundingIncrement': [value: number]
  'update:durationRoundingMethod': [value: string]
}>()

const roundingIncrementOptions = ROUNDING_INCREMENT_OPTIONS
const roundingMethodOptions = ROUNDING_METHOD_OPTIONS
</script>

<template>
  <div class="mb-6">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.sections.durationRoundingTitle }}</div>
    <VSwitch
      :model-value="durationRoundingEnabled"
      @update:model-value="(v: boolean | null) => emit('update:durationRoundingEnabled', v === true)"
      :label="UI_STRINGS.labels.enableDurationRounding"
      class="mb-4"
    />
    <div v-if="durationRoundingEnabled" class="ml-8">
      <VSelect
        :model-value="durationRoundingIncrement"
        @update:model-value="(v: number | string) => emit('update:durationRoundingIncrement', Number(v))"
        :items="roundingIncrementOptions"
        :label="UI_STRINGS.labels.roundingIncrement"
        :hint="UI_STRINGS.hints.roundingIncrement"
        persistent-hint
        :rules="[
          (v: number) => !!v || UI_STRINGS.validation.roundingIncrementRequired,
        ]"
        class="mb-4"
      />
      <VSelect
        :model-value="durationRoundingMethod"
        @update:model-value="emit('update:durationRoundingMethod', $event)"
        :items="roundingMethodOptions"
        :label="UI_STRINGS.labels.roundingMethod"
        :hint="UI_STRINGS.hints.roundingMethod"
        persistent-hint
        class="mb-2"
      />
    </div>
    <div class="text-caption mt-2">
      {{ UI_STRINGS.help.durationRoundingDescription }}
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
