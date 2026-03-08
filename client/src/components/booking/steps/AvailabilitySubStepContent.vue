<!--
  Shared sub-step content: calendar, options, graph, slots, moveable.
  Used in narrow (VExpansionPanelText) and wide (section content).
-->
<script setup lang="ts">
import { inject } from 'vue'
import { availabilitySubStepContextKey } from '@/composables/booking/injectionKeys'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'
import AvailabilityCalendarSection from '@/components/booking/steps/AvailabilityCalendarSection.vue'
import AvailabilityOptionsSection from '@/components/booking/steps/AvailabilityOptionsSection.vue'

interface Props {
  stepIndex: number
}
defineProps<Props>()

const ctx = inject(availabilitySubStepContextKey)
if (!ctx) {
  throw new Error('AvailabilitySubStepContent must be used inside AvailabilityStep')
}
</script>

<template>
  <!-- Step 0: Pick a day -->
  <div v-if="stepIndex === 0" class="calendar-col">
    <VAlert
      v-if="(ctx.firstAvailableNotice ?? '').trim()"
      type="info"
      variant="tonal"
      closable
      density="compact"
      class="first-available-notice mb-2"
      @click:close="ctx.clearFirstAvailableNotice"
    >
      {{ ctx.firstAvailableNotice }}
    </VAlert>
    <AvailabilityCalendarSection
      :model-value="ctx.o.selectedDateSingle.value"
      :display-date="ctx.o.vDatePickerDisplayDate.value"
      :min="ctx.o.getTodayDate()"
      :allowed-dates="(date: unknown) => ctx.o.allowedDates.value(date as string)"
      :selected-date-error="ctx.o.fieldErrors.value?.selectedDate"
      @update:model-value="ctx.handleDateChangeWithConfirm($event)"
      @update:display-date="ctx.o.setVDatePickerDisplayDate($event)"
    />
  </div>
  <!-- Step 1: Options -->
  <div v-else-if="stepIndex === 1" class="availability-options-below-calendar">
    <AvailabilityOptionsSection
      :has-selected-services="ctx.o.wizard.selectedServiceTypeBlocks.value.length > 0"
      :cascade-error="ctx.o.wizard.availabilityOptionsCascadeError?.value ?? null"
      :available-option-type-blocks="ctx.o.wizard.availableOptionTypeBlocks.value"
      :selected-option-type-block-id="ctx.o.selectedOptionTypeBlockId.value"
      @update:selected-option-type-block-id="ctx.onOptionIdUpdate"
    />
  </div>
  <!-- Step 2: Perspective -->
  <div v-else-if="stepIndex === 2" class="time-selection-content">
    <DifferentialGraph
      v-if="ctx.o.isEffectivelyDifferential.value"
      :is-differential-service="ctx.o.isEffectivelyDifferential.value"
      :graph-bars="ctx.o.graphBars.value"
      :selected-services="ctx.o.wizard.selectedServiceTypeBlocks.value"
      :start-time-type="ctx.o.perspective.value"
      class="differential-graph-above-slots"
      @time-basis-change="ctx.handleTimeBasisChangeWithConfirm"
    />
  </div>
  <!-- Step 3: Pick a time -->
  <div v-else-if="stepIndex === 3" class="time-selection-content">
    <template v-if="ctx.o.selectedDate.value?.start">
      <div v-if="ctx.o.appointmentSlots.value.length === 0" class="text-body-medium text-medium-emphasis py-4 mb-4 mb-sm-6">
        {{ ctx.emptyStateMessage }}
      </div>
      <div v-else class="slot-grid-wrapper" :class="{ 'slot-grid-wrapper--overlay': ctx.showSlotsOverlay }">
        <div v-if="ctx.showSlotsOverlay" class="slot-grid-overlay">
          <span v-if="ctx.slotGridOverlayError" class="slot-grid-overlay-text slot-grid-overlay-error">{{ ctx.slotGridOverlayError }}</span>
          <span v-else class="slot-grid-overlay-text">{{ ctx.slotGridOverlayLabel }}</span>
        </div>
        <AppointmentSlotGrid
          :appointment-slots="ctx.o.appointmentSlots.value"
          :selected-button-index="ctx.o.selectedButtonIndex.value"
          :time-basis="ctx.o.perspective.value"
          :color="ctx.o.slotColor.value"
          class="appointment-slot-grid-abut"
          @slot-click="ctx.handleSlotClickWithConfirm"
        />
      </div>
      <div v-if="ctx.o.fieldErrors.value?.selectedTimeSlot" class="text-error text-body-small mt-2 mb-2">
        {{ ctx.o.fieldErrors.value?.selectedTimeSlot }}
      </div>
    </template>
    <div v-else class="d-flex align-center justify-start date-placeholder">
      <p class="text-body-large text-medium-emphasis">Select a date from the calendar to see available time slots</p>
    </div>
  </div>
  <!-- Step 4: Confirm moveable details (placeholder until 6.9.4) -->
  <div v-else-if="stepIndex === 4" class="availability-step-5-slot">
    <p class="text-body-medium text-medium-emphasis">Confirm moveable details (content in Session 6.9.4)</p>
  </div>
</template>

<style scoped lang="scss">
.first-available-notice {
  font-size: 0.8125rem;
}
</style>
