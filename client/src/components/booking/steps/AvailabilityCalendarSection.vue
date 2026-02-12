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

<style scoped lang="scss">
.calendar-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  align-items: flex-start;
  gap: 0;

  :deep(.availability-calendar) {
    box-sizing: border-box;
    .v-date-picker-header,
    .v-date-picker-month__header,
    [class*="date-picker-header"],
    [class*="date-picker-month-header"] {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
      overflow: hidden !important;
    }
    .v-date-picker-header__content,
    .v-date-picker-header__title,
    .v-date-picker-header__prepend,
    .v-date-picker-header__append,
    .v-date-picker-month__header__content,
    .v-date-picker-month__header__title,
    [class*="header__content"],
    [class*="header__title"] {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      visibility: hidden !important;
      overflow: hidden !important;
    }
    .v-date-picker-month {
      margin-top: 0 !important;
      padding-top: 0 !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    .v-date-picker-month__day--today,
    .v-date-picker-month__day.v-date-picker-month__day--today {
      .v-btn {
        border: 2px solid rgba(var(--v-theme-on-surface), 0.3) !important;
        background-color: transparent !important;
        font-weight: 600;
      }
    }
    .v-date-picker-month__day--selected,
    .v-date-picker-month__day.v-date-picker-month__day--selected {
      .v-btn {
        background-color: rgb(var(--v-theme-primary)) !important;
        color: rgb(var(--v-theme-on-primary)) !important;
        font-weight: 600;
      }
    }
    .v-date-picker-month__day .v-btn {
      min-width: 44px;
      min-height: 44px;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      transition: all 0.2s ease;
      &:hover:not(.v-btn--disabled) {
        background-color: rgba(var(--v-theme-primary), 0.1);
      }
      @media (min-width: 600px) {
        min-width: auto;
        min-height: auto;
      }
    }
    .v-date-picker-month__weekday {
      font-weight: 600;
      padding: 0.5rem 0;
      color: rgba(var(--v-theme-on-surface), 0.7);
    }
    .v-date-picker-month__day--disabled .v-btn {
      opacity: 0.35;
      cursor: not-allowed;
      text-decoration: line-through;
      text-decoration-color: rgba(var(--v-theme-on-surface), 0.3);
    }
  }
}

.time-graph-wrapper {
  margin-top: 0.5rem;
  margin-bottom: 0;
}
</style>
