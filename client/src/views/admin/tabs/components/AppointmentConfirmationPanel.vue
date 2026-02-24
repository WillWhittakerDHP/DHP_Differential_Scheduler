<!--
  Confirmation & holds: auto-confirm appointments, appointment hold duration
  WHY: Grouped under Calendar as settings related to appointment confirmation status and event holds
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const HOLD_DURATION_MIN = 1
const HOLD_DURATION_MAX = 60

function clampHoldDuration(value: number): number {
  const n = Number.isNaN(value) ? 15 : Math.floor(value)
  return Math.min(HOLD_DURATION_MAX, Math.max(HOLD_DURATION_MIN, n))
}

function holdDurationRule(value: unknown): true | string {
  const n = Number(value)
  if (Number.isNaN(n)) return UI_STRINGS.calendar.holdDurationMin
  if (n < HOLD_DURATION_MIN) return UI_STRINGS.calendar.holdDurationMin
  if (n > HOLD_DURATION_MAX) return UI_STRINGS.calendar.holdDurationMax
  return true
}

defineProps<{
  holdDurationMinutes: number
  autoConfirmEnabled: boolean
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:holdDurationMinutes': [value: number]
  'update:autoConfirmEnabled': [value: boolean]
}>()
</script>

<template>
  <div class="mb-6">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.tabs.confirmationAndHolds }}</div>
    <div class="text-body-2 mb-4 text-medium-emphasis">
      Settings for appointment confirmation status and time-slot hold behavior.
    </div>

    <VSwitch
      :model-value="autoConfirmEnabled"
      @update:model-value="(v: boolean | null) => emit('update:autoConfirmEnabled', v === true)"
      :label="UI_STRINGS.calendar.autoConfirmLabel"
      :hint="UI_STRINGS.calendar.autoConfirmHint"
      persistent-hint
      class="mb-4"
    />

    <VDivider class="my-4" />

    <div class="text-subtitle-2 mb-2">{{ UI_STRINGS.calendar.appointmentHoldsTitle }}</div>
    <VTextField
      :model-value="holdDurationMinutes"
      @update:model-value="(v: string | number) => emit('update:holdDurationMinutes', clampHoldDuration(Number(v)))"
      type="number"
      :min="1"
      :max="60"
      :label="UI_STRINGS.calendar.holdDurationLabel"
      :hint="UI_STRINGS.calendar.holdDurationHint"
      persistent-hint
      class="mb-4"
      :rules="[holdDurationRule]"
      validate-on="blur"
    />

    <div class="text-caption mt-2">
      {{ UI_STRINGS.calendar.holdDurationHint }}
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
