<script setup lang="ts">

interface Props {
  modelValue: string | null
  displayDate: Date
  min: string
  allowedDates?: ((date: unknown) => boolean) | undefined
  selectedDateError?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:displayDate': [value: Date]
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

    <div v-if="selectedDateError" class="text-error text-body-small mt-2">
      {{ selectedDateError }}
    </div>
  </div>
</template>

<style scoped lang="scss" src="./AvailabilityCalendarSection.scss"></style>
