<!--
  Confirmation & holds: auto-confirm appointments, appointment hold duration
  WHY: Grouped under Calendar as settings related to appointment confirmation status and event holds
-->
<script setup lang="ts">
import { inject } from 'vue'
import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { useConfirmationAndHoldsPanel } from '@/composables/admin/useConfirmationAndHoldsPanel'
import { BUSINESS_CONTROLS_STATE_KEY, type BusinessControlsState } from '../businessControlsStateKey'
import DriveTimeFeeAdminFields from './DriveTimeFeeAdminFields.vue'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const props = withDefaults(
  defineProps<{
    holdDurationMinutes: number
    autoConfirmEnabled: boolean
    /** Admin entry dropdown time-out: value (X). Session 6.8.6.1 */
    adminEntryTimeoutValue?: number
    /** Admin entry dropdown time-out: unit (days | weeks). Session 6.8.6.1 */
    adminEntryTimeoutUnit?: 'days' | 'weeks'
    /** Min allowed (from admin settings). */
    holdDurationMin?: number
    /** Max allowed (from admin settings). */
    holdDurationMax?: number
    /** Default when value missing/invalid (from admin settings). */
    holdDurationFallback?: number
    saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
  }>(),
  { holdDurationMin: 1, holdDurationMax: 60, holdDurationFallback: 15, adminEntryTimeoutValue: 30, adminEntryTimeoutUnit: 'days' }
)

const emit = defineEmits<{
  'update:holdDurationMinutes': [value: number]
  'update:holdDurationMin': [value: number]
  'update:holdDurationMax': [value: number]
  'update:holdDurationFallback': [value: number]
  'update:autoConfirmEnabled': [value: boolean]
  'update:adminEntryTimeoutValue': [value: number]
  'update:adminEntryTimeoutUnit': [value: 'days' | 'weeks']
}>()

const {
  holdDurationHintText,
  holdDurationRule,
  handleAutoConfirmUpdate,
  handleHoldDurationMinutes,
  handleHoldDurationMin,
  handleHoldDurationMax,
  handleHoldDurationFallback,
  handleAdminEntryTimeoutValue,
  handleAdminEntryTimeoutUnit,
} = useConfirmationAndHoldsPanel(props, emit)

const businessState = inject<BusinessControlsState | null>(BUSINESS_CONTROLS_STATE_KEY, null)

function onDriveTimeFeeUpdate(value: DriveTimeFeeConfig): void {
  const fd = businessState?.availabilityFormData
  if (fd) {
    fd.driveTimeFee = value
  }
}
</script>

<template>
  <div class="mb-6">
    <div class="text-body-large mb-3">{{ UI_STRINGS.tabs.confirmationAndHolds }}</div>
    <div class="text-body-medium mb-4 text-medium-emphasis">
      Settings for appointment confirmation status and time-slot hold behavior.
    </div>

    <VSwitch
      :model-value="autoConfirmEnabled"
      @update:model-value="handleAutoConfirmUpdate"
      :label="UI_STRINGS.calendar.autoConfirmLabel"
      :hint="UI_STRINGS.calendar.autoConfirmHint"
      persistent-hint
      class="mb-4"
    />

    <VDivider class="my-4" />

    <div class="text-label-large mb-2">{{ UI_STRINGS.calendar.adminEntryTimeoutLabel }}</div>
    <p class="text-body-small text-medium-emphasis mb-2">
      {{ UI_STRINGS.calendar.adminEntryTimeoutHint }}
    </p>
    <div class="d-flex gap-2 align-center flex-wrap mb-4">
      <VTextField
        :model-value="adminEntryTimeoutValue"
        @update:model-value="handleAdminEntryTimeoutValue"
        type="number"
        min="1"
        max="365"
        class="flex-grow-0"
        style="max-width: 6rem;"
        density="compact"
        hide-details
      />
      <VSelect
        :model-value="adminEntryTimeoutUnit"
        @update:model-value="handleAdminEntryTimeoutUnit"
        :items="[{ title: 'Days', value: 'days' }, { title: 'Weeks', value: 'weeks' }]"
        density="compact"
        hide-details
        style="max-width: 8rem;"
      />
    </div>

    <VDivider class="my-4" />

    <div class="text-label-large mb-2">{{ UI_STRINGS.calendar.appointmentHoldsTitle }}</div>
    <VTextField
      :model-value="holdDurationMinutes"
      @update:model-value="handleHoldDurationMinutes"
      type="number"
      :min="holdDurationMin"
      :max="holdDurationMax"
      :label="UI_STRINGS.calendar.holdDurationLabel"
      :hint="holdDurationHintText"
      persistent-hint
      class="mb-4"
      :rules="[holdDurationRule]"
      validate-on="blur"
    />
    <VTextField
      :model-value="holdDurationMin"
      @update:model-value="handleHoldDurationMin"
      type="number"
      min="1"
      label="Hold duration min (minutes)"
      hint="Minimum allowed hold duration. Used for validation and clamping."
      persistent-hint
      class="mb-4"
    />
    <VTextField
      :model-value="holdDurationMax"
      @update:model-value="handleHoldDurationMax"
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
      @update:model-value="handleHoldDurationFallback"
      type="number"
      :min="holdDurationMin"
      :max="holdDurationMax"
      label="Default hold duration when missing (minutes)"
      hint="Used when no value is provided or value is invalid."
      persistent-hint
      class="mb-4"
    />

    <div class="text-body-small mt-2">
      How long a slot is held before it expires. Allowed range: {{ holdDurationMin }}–{{ holdDurationMax }} minutes.
    </div>
  </div>

  <VDivider v-if="businessState?.availabilityFormData?.driveTimeFee" class="my-4" />

  <DriveTimeFeeAdminFields
    v-if="businessState?.availabilityFormData?.driveTimeFee"
    :model-value="businessState.availabilityFormData.driveTimeFee"
    @update:model-value="onDriveTimeFeeUpdate"
  />

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
