<!--
  Confirmation & holds: auto-confirm appointments, appointment hold duration
  WHY: Grouped under Calendar as settings related to appointment confirmation status and event holds
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const props = withDefaults(
  defineProps<{
    holdDurationMinutes: number
    autoConfirmEnabled: boolean
    /** Min allowed (from admin settings). */
    holdDurationMin?: number
    /** Max allowed (from admin settings). */
    holdDurationMax?: number
    /** Default when value missing/invalid (from admin settings). */
    holdDurationFallback?: number
    saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
  }>(),
  { holdDurationMin: 1, holdDurationMax: 60, holdDurationFallback: 15 }
)

function clampHoldDuration(value: number): number {
  const n = Number.isNaN(value) ? props.holdDurationFallback : Math.floor(value)
  return Math.min(props.holdDurationMax, Math.max(props.holdDurationMin, n))
}

function holdDurationRule(value: unknown): true | string {
  const n = Number(value)
  if (Number.isNaN(n)) return `Hold duration must be at least ${props.holdDurationMin} minute(s).`
  if (n < props.holdDurationMin) return `Hold duration must be at least ${props.holdDurationMin} minute(s).`
  if (n > props.holdDurationMax) return `Hold duration cannot exceed ${props.holdDurationMax} minutes.`
  return true
}

const emit = defineEmits<{
  'update:holdDurationMinutes': [value: number]
  'update:holdDurationMin': [value: number]
  'update:holdDurationMax': [value: number]
  'update:holdDurationFallback': [value: number]
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
      :min="holdDurationMin"
      :max="holdDurationMax"
      :label="UI_STRINGS.calendar.holdDurationLabel"
      :hint="`How long a slot is held before it expires. Allowed range: ${holdDurationMin}–${holdDurationMax} minutes.`"
      persistent-hint
      class="mb-4"
      :rules="[holdDurationRule]"
      validate-on="blur"
    />
    <VTextField
      :model-value="holdDurationMin"
      @update:model-value="(v: string | number) => emit('update:holdDurationMin', Math.max(1, Math.floor(Number(v)) || 1))"
      type="number"
      min="1"
      label="Hold duration min (minutes)"
      hint="Minimum allowed hold duration. Used for validation and clamping."
      persistent-hint
      class="mb-4"
    />
    <VTextField
      :model-value="holdDurationMax"
      @update:model-value="(v: string | number) => emit('update:holdDurationMax', Math.min(1440, Math.floor(Number(v)) || 60))"
      type="number"
      min="1"
      max="1440"
      label="Hold duration max (minutes)"
      hint="Maximum allowed hold duration. Used for validation and clamping."
      persistent-hint
      class="mb-4"
    />
    <VTextField
      :model-value="holdDurationFallback"
      @update:model-value="(v: string | number) => emit('update:holdDurationFallback', clampHoldDuration(Number(v)))"
      type="number"
      :min="holdDurationMin"
      :max="holdDurationMax"
      label="Default hold duration when missing (minutes)"
      hint="Used when no value is provided or value is invalid."
      persistent-hint
      class="mb-4"
    />

    <div class="text-caption mt-2">
      How long a slot is held before it expires. Allowed range: {{ holdDurationMin }}–{{ holdDurationMax }} minutes.
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
