<!--
  Drive-time **billing** fields (availability JSON) — not overlap buffers.
  WHY: Thin presentational slice; parent owns `availability.formData` and save (Calendar tab saves availability too).
-->
<script setup lang="ts">
import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

const props = defineProps<{
  modelValue: DriveTimeFeeConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DriveTimeFeeConfig]
}>()

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

function emitPatch(partial: Partial<DriveTimeFeeConfig>): void {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

function parseNonNegative(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n < 0) {
    return fallback
  }
  return n
}

function parseRoundingMinutes(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n < 1) {
    return fallback
  }
  return Math.floor(n)
}

function onComplimentary(raw: string | number): void {
  emitPatch({ complimentaryDriveMinutes: parseNonNegative(raw, props.modelValue.complimentaryDriveMinutes) })
}

function onRate(raw: string | number): void {
  emitPatch({ drivingRatePerHour: parseNonNegative(raw, props.modelValue.drivingRatePerHour) })
}

function onRounding(raw: string | number): void {
  emitPatch({
    driveTimeRoundingMinutes: parseRoundingMinutes(raw, props.modelValue.driveTimeRoundingMinutes),
  })
}
</script>

<template>
  <div class="mb-2">
    <div class="text-label-large mb-2">{{ UI_STRINGS.calendar.driveTimeFeeSectionTitle }}</div>
    <p class="text-body-small text-medium-emphasis mb-4">
      {{ UI_STRINGS.calendar.driveTimeFeeSectionHint }}
    </p>

    <VTextField
      :model-value="modelValue.complimentaryDriveMinutes"
      type="number"
      min="0"
      step="1"
      :label="UI_STRINGS.calendar.complimentaryDriveMinutesLabel"
      :hint="UI_STRINGS.calendar.complimentaryDriveMinutesHint"
      persistent-hint
      class="mb-4"
      density="compact"
      @update:model-value="onComplimentary"
    />

    <VTextField
      :model-value="modelValue.drivingRatePerHour"
      type="number"
      min="0"
      step="0.01"
      :label="UI_STRINGS.calendar.drivingRatePerHourLabel"
      :hint="UI_STRINGS.calendar.drivingRatePerHourHint"
      persistent-hint
      class="mb-4"
      density="compact"
      @update:model-value="onRate"
    />

    <VTextField
      :model-value="modelValue.driveTimeRoundingMinutes"
      type="number"
      min="1"
      step="1"
      :label="UI_STRINGS.calendar.driveTimeRoundingMinutesLabel"
      :hint="UI_STRINGS.calendar.driveTimeRoundingMinutesHint"
      persistent-hint
      class="mb-4"
      density="compact"
      @update:model-value="onRounding"
    />
  </div>
</template>
