<script setup lang="ts">

import { inject, computed } from 'vue'
import { wizardKey } from '@/composables/booking/injectionKeys'
import { useAvailabilityOrchestrator } from '@/composables/booking/useAvailabilityOrchestrator'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import {
  computedAvailabilityKey,
  propertyDetailsStepDataKey,
  displayedMonthKey,
  updateDisplayedMonthKey,
  appointmentDurationKey,
  availabilityStepDataKey,
  availabilityStepValidKey,
  availabilityStepValidateKey,
  loadedWizardStateKey,
} from '@/composables/booking/injectionKeys'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'
import AvailabilityCalendarSection from '@/components/booking/steps/AvailabilityCalendarSection.vue'
import AvailabilityOptionsSection from '@/components/booking/steps/AvailabilityOptionsSection.vue'
import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'

const wizard = inject(wizardKey)
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject(loadedWizardStateKey)
if (!loadedWizardState) {
  throw new Error('loadedWizardState not provided. Make sure BookingWizard provides loadedWizardState.')
}

const computedAvailability = inject(computedAvailabilityKey)
if (!computedAvailability) {
  throw new Error('computedAvailability must be provided by BookingWizard')
}

const propertyDetailsStepData = inject(propertyDetailsStepDataKey)
if (!propertyDetailsStepData) {
  throw new Error('propertyDetailsStepData not provided. Make sure BookingWizard provides propertyDetailsStepData.')
}

const displayedMonth = inject(displayedMonthKey)
const updateDisplayedMonth = inject(updateDisplayedMonthKey)
if (!displayedMonth || !updateDisplayedMonth) {
  throw new Error('displayedMonth and updateDisplayedMonth must be provided by BookingWizard')
}

const appointmentDurationRef = inject(appointmentDurationKey)
if (!appointmentDurationRef) {
  throw new Error('appointmentDuration must be provided by BookingWizard')
}

const orchestrator = useAvailabilityOrchestrator({
  wizard,
  loadedWizardState,
  computedAvailability,
  propertyDetailsStepData,
  displayedMonth,
  updateDisplayedMonth,
  appointmentDurationRef
})
const o = {
  ...orchestrator.data,
  ...orchestrator.actions,
  wizard: orchestrator.wizard,
}

useWizardStepSync({
  stepData: o.stepData,
  isFormValid: o.isFormValid,
  validateForm: o.validateForm,
  stepDataKey: availabilityStepDataKey,
  stepValidKey: availabilityStepValidKey,
  stepValidateKey: availabilityStepValidateKey
})

function onOptionIdUpdate(id: string | null): void {
  o.selectedOptionTypeBlockId.value = id
}

const { settings: availabilitySettings } = useAvailabilitySettings()
const selectTimeSlotLabel = computed(
  () => availabilitySettings.value?.differentialPerspectives?.selectTimeSlotLabel || 'Select a Time Slot'
)
const hasSelectedSlot = computed(
  () => o.graphBars.value?.major != null || o.graphBars.value?.minor != null
)
const showSlotsOverlay = computed(
  () =>
    o.isEffectivelyDifferential.value &&
    !hasSelectedSlot.value &&
    !o.userHasChosenTimeBasisFromGraph?.value
)

/** Sub-step model for mini-wizard (Phase 6.9): id, label, visible. Step 5 visible when slot has moveable parts + service preClosing. */
const availabilitySubSteps = computed(() => {
  const hasDate = !!o.selectedDate.value?.start
  const showOptions = (o.wizard.availableOptionTypeBlocks.value?.length ?? 0) > 0
  const showPerspective = hasDate && o.isEffectivelyDifferential.value
  const showMoveable = o.hasMoveablePartsGated?.value ?? false
  return [
    { id: 1, label: '1. Pick a day', visible: true },
    { id: 2, label: '2. Options', visible: showOptions },
    { id: 3, label: '3. Perspective', visible: showPerspective },
    { id: 4, label: '4. Pick a time', visible: true },
    { id: 5, label: '5. Confirm moveable details', visible: showMoveable },
  ]
})
</script>

<template>
  <div class="availability-step">
    <VRow class="calendar-grid-row">
      <VCol cols="12" class="position-relative overflow-visible">
        <div class="d-flex align-center justify-space-between flex-wrap mb-2">
          <div>
            <h4 class="text-headline-large mb-2">Appointment Availability</h4>
            <p class="text-body-medium mb-6 mb-sm-4">Select a time that works for everybody</p>
          </div>
        </div>
      </VCol>

      <VCol v-if="(o.firstAvailableNotice?.value ?? '').trim()" cols="12" class="pt-0 pb-2">
        <VAlert
          type="info"
          variant="tonal"
          closable
          density="compact"
          class="first-available-notice"
          @click:close="o.clearFirstAvailableNotice"
        >
          {{ o.firstAvailableNotice?.value }}
        </VAlert>
      </VCol>

      <VCol cols="12" class="calendar-col">
        <p v-if="availabilitySubSteps[0].visible" class="text-subtitle-1 font-weight-medium mb-2 availability-step-label">
          {{ availabilitySubSteps[0].label }}
        </p>
        <AvailabilityCalendarSection
          :model-value="o.selectedDateSingle.value"
          :display-date="o.vDatePickerDisplayDate.value"
          :min="o.getTodayDate()"
          :allowed-dates="(date: unknown) => o.allowedDates.value(date as string)"
          :selected-date-error="o.fieldErrors.value?.selectedDate"
          @update:model-value="o.handleDateChange($event)"
          @update:display-date="o.setVDatePickerDisplayDate($event)"
        />
        <template v-if="availabilitySubSteps[1].visible">
          <p class="text-subtitle-1 font-weight-medium mb-2 mt-4 availability-step-label">
            {{ availabilitySubSteps[1].label }}
          </p>
          <AvailabilityOptionsSection
            :has-selected-services="o.wizard.selectedServiceTypeBlocks.value.length > 0"
            :cascade-error="o.wizard.availabilityOptionsCascadeError?.value ?? null"
            :available-option-type-blocks="o.wizard.availableOptionTypeBlocks.value"
            :selected-option-type-block-id="o.selectedOptionTypeBlockId.value"
            class="availability-options-below-calendar"
            @update:selected-option-type-block-id="onOptionIdUpdate"
          />
        </template>
      </VCol>

      <VCol cols="12" class="time-selection-col">
        <div class="time-selection-content">
          <template v-if="o.selectedDate.value?.start">
            <template v-if="availabilitySubSteps[2].visible">
              <p class="text-subtitle-1 font-weight-medium mb-2 availability-step-label">
                {{ availabilitySubSteps[2].label }}
              </p>
            </template>
            <DifferentialGraph
              v-if="o.isEffectivelyDifferential.value"
              :is-differential-service="o.isEffectivelyDifferential.value"
              :graph-bars="o.graphBars.value"
              :selected-services="o.wizard.selectedServiceTypeBlocks.value"
              :start-time-type="o.perspective.value"
              class="differential-graph-above-slots"
              @time-basis-change="o.handleTimeBasisChange"
            />
            <p class="text-subtitle-1 font-weight-medium mb-2 mt-4 availability-step-label">
              {{ availabilitySubSteps[3].label }}
            </p>
            <div v-if="o.appointmentSlots.value.length === 0" class="text-body-medium text-medium-emphasis py-4 mb-4 mb-sm-6">
              {{ o.emptyStateMessage }}
            </div>
            <div v-else class="slot-grid-wrapper" :class="{ 'slot-grid-wrapper--overlay': showSlotsOverlay }">
              <div v-if="showSlotsOverlay" class="slot-grid-overlay">
                <span class="slot-grid-overlay-text">{{ selectTimeSlotLabel }}</span>
              </div>
              <AppointmentSlotGrid
                :appointment-slots="o.appointmentSlots.value"
                :selected-button-index="o.selectedButtonIndex.value"
                :time-basis="o.perspective.value"
                :color="o.slotColor.value"
                class="appointment-slot-grid-abut"
                @slot-click="o.handleAppointmentSlotClick"
              />
            </div>
            <div v-if="o.fieldErrors.value?.selectedTimeSlot" class="text-error text-body-small mt-2 mb-2">
              {{ o.fieldErrors.value?.selectedTimeSlot }}
            </div>
            <template v-if="availabilitySubSteps[4].visible">
              <p class="text-subtitle-1 font-weight-medium mb-2 mt-4 availability-step-label">
                {{ availabilitySubSteps[4].label }}
              </p>
              <div class="availability-step-5-slot">
                <p class="text-body-small text-medium-emphasis">Confirm moveable details when applicable (content in Session 6.9.4).</p>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="d-flex align-center justify-start date-placeholder">
              <p class="text-body-large text-medium-emphasis">Select a date from the calendar to see available time slots</p>
            </div>
          </template>
        </div>
      </VCol>
    </VRow>

    <MoveablePartsModal
      :show-modal="o.showMoveableModal.value"
      :moveable-options="o.moveableOptions.value"
      :moveable-part-shape-name="o.moveablePartShapeName.value"
      :moveable-appointment-slots="o.moveableAppointmentSlots.value"
      :selected-moveable-day="o.selectedMoveableDay.value"
      :allowed-moveable-dates="o.allowedMoveableDates.value"
      :is-loading-moveable-day-slots="o.isLoadingMoveableDaySlots.value"
      :selected-slot-index="o.selectedMoveableSlotIndex.value"
      :contingency-period="o.contingencyPeriod.value"
      :is-loading-options="o.isLoadingOptions.value"
      @update:show-modal="o.showMoveableModal.value = $event"
      @update:selected-moveable-day="o.setSelectedMoveableDay"
      @update:contingency-period="o.contingencyPeriod.value = $event"
      @select-slot="o.selectMoveableSlot"
      @confirm="o.handleMoveableConfirm"
      @cancel="o.handleMoveableCancel"
    />
  </div>
</template>

<style scoped lang="scss">
.availability-step {
  padding: 0;
}

.overflow-visible {
  overflow: visible;
}

.first-available-notice {
  font-size: 0.8125rem;
}

.calendar-col {
  margin-bottom: 1.5rem;
  @media (min-width: 600px) {
    margin-bottom: 0;
    flex: 0 0 auto !important;
    max-width: none !important;
    width: auto !important;
  }

  :deep(.calendar-container) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  :deep(.availability-calendar),
  :deep(.v-date-picker) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  :deep(.v-picker__body) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  :deep(.v-date-picker-month) {
    margin-bottom: 0;
    padding-bottom: 0;
  }
  /* Collapse adjacent-month placeholder cells so they don't add empty rows and gap below the visible dates */
  :deep(.v-date-picker-month__day--hide-adjacent) {
    height: 0;
    min-height: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    visibility: hidden;
  }
  :deep(.v-date-picker-month__day:has(.v-date-picker-month__day--hide-adjacent)) {
    height: 0;
    min-height: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
}

.time-selection-col {
  padding-left: 0;
  min-width: 0;
  @media (min-width: 600px) {
    padding-left: 1rem;
    flex: 1 1 0% !important;
  }
}

.time-selection-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 300px;
  flex: 1 1 auto;
  @media (min-width: 600px) {
    min-height: 350px;
  }
}

.date-placeholder {
  min-height: 300px;
  width: 100%;
  @media (min-width: 600px) {
    min-height: 400px;
  }
}

.appointment-slot-grid-abut {
  margin-bottom: 0 !important;
}

.differential-graph-above-slots {
  flex-shrink: 0;
}

.availability-options-below-calendar {
  margin-top: 1rem; /* Match slot-grid-wrapper gap (graph to slots) */
}

.slot-grid-wrapper {
  position: relative;
  margin-top: 1rem; /* Consistent gap below differential graph regardless of overlay state */
}

.slot-grid-wrapper--overlay {
  filter: grayscale(0.5);
  opacity: 0.6;
}

.slot-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface), 0.9);
  z-index: 10;
  pointer-events: none;
}

.slot-grid-overlay-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
  padding: 1rem;

  @media (max-width: 599px) {
    font-size: 1.25rem;
  }
}

.availability-step-label {
  color: rgb(var(--v-theme-on-surface));
}

/* Reserved slot for sub-step 5 (Confirm moveable details); content in Session 6.9.4 */
.availability-step-5-slot {
  padding: 1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>
