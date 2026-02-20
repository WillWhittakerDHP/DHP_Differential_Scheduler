<script setup lang="ts">
/**
 * AvailabilityCalendarSection – calendar picker and differential graph.
 * Used by AvailabilityStep; receives date state and graph data as props, emits date changes.
 */

import type { TimeRange } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'

interface Props {
  modelValue: string | null
  displayDate: Date
  min: string
  allowedDates?: ((date: unknown) => boolean) | undefined
  selectedDateError?: string
  isEffectivelyDifferential: boolean
  graphBars: { major: TimeRange | null; minor: TimeRange | null }
  selectedServices: BookingBlockInstance[]
  perspective: 'major' | 'minor' | 'nonDifferential'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:displayDate': [value: Date]
  'time-basis-change': [type: 'major' | 'minor']
}>()
</script>

<template>
  <div class="calendar-container">
    <VDatePicker
      :model-value="modelValue"
      :display-date="displayDate"
      :min="min"
      :allowed-dates="allowedDates"
      :show-adjacent-months="false"
      :first-day-of-week="0"
      color="primary"
      view-mode="month"
      hide-header
      class="availability-calendar"
      aria-label="Select appointment date"
      @update:model-value="emit('update:modelValue', $event)"
      @update:display-date="emit('update:displayDate', $event)"
    />

    <div v-if="selectedDateError" class="text-error text-caption mt-2">
      {{ selectedDateError }}
    </div>

    <DifferentialGraph
      :is-differential-service="isEffectivelyDifferential"
      :graph-bars="graphBars"
      :selected-services="selectedServices"
      :start-time-type="perspective"
      class="time-graph-wrapper"
      @time-basis-change="emit('time-basis-change', $event)"
    />
  </div>
</template>

<style scoped lang="scss" src="./AvailabilityCalendarSection.scss"></style>
