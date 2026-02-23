<script setup lang="ts">
/**
 * AvailabilityStep – Third step for appointment date and time selection.
 * Uses useAvailabilityOrchestrator for all logic; template delegates to AvailabilityCalendarSection,
 * AppointmentSlotGrid, AvailabilityOptionsSection, and MoveablePartsModal.
 */

import { inject, type Ref } from 'vue'
import type { DisplayedMonth } from '@/composables/booking/useDateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/composables/booking/useComputedAvailability'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { useAvailabilityOrchestrator } from '@/composables/booking/useAvailabilityOrchestrator'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import AvailabilityCalendarSection from '@/components/booking/steps/AvailabilityCalendarSection.vue'
import AvailabilityOptionsSection from '@/components/booking/steps/AvailabilityOptionsSection.vue'
import MoveablePartsModal from '@/components/booking/MoveablePartsModal.vue'

const wizard = inject<ReturnType<typeof useBookingWizard>>('wizard')
if (!wizard) {
  throw new Error('Wizard instance not provided. Make sure BookingWizard component provides the wizard instance.')
}

const loadedWizardState = inject<Ref<WizardStateData | null>>('loadedWizardState')
if (!loadedWizardState) {
  throw new Error('loadedWizardState not provided. Make sure BookingWizard provides loadedWizardState.')
}

const computedAvailability = inject<UseComputedAvailabilityReturn>('computedAvailability')
if (!computedAvailability) {
  throw new Error('computedAvailability must be provided by BookingWizard')
}

const propertyDetailsStepData = inject<Ref<{ squareFootage?: number | null; bedrooms?: number | null; bathrooms?: number | null; foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null; additionalUnits?: number | null; [key: string]: unknown } | null>>('propertyDetailsStepData')
if (!propertyDetailsStepData) {
  throw new Error('propertyDetailsStepData not provided. Make sure BookingWizard provides propertyDetailsStepData.')
}

const displayedMonth = inject<Ref<DisplayedMonth>>('displayedMonth')
const updateDisplayedMonth = inject<(month: DisplayedMonth) => void>('updateDisplayedMonth')
if (!displayedMonth || !updateDisplayedMonth) {
  throw new Error('displayedMonth and updateDisplayedMonth must be provided by BookingWizard')
}

const appointmentDurationRef = inject<Ref<number | null>>('appointmentDuration')
if (!appointmentDurationRef) {
  throw new Error('appointmentDuration must be provided by BookingWizard')
}

const o = useAvailabilityOrchestrator({
  wizard,
  loadedWizardState,
  computedAvailability,
  propertyDetailsStepData,
  displayedMonth,
  updateDisplayedMonth,
  appointmentDurationRef
})

useWizardStepSync({
  stepData: o.stepData,
  isFormValid: o.isFormValid,
  validateForm: o.validateForm,
  stepDataKey: 'availabilityStepData',
  stepValidKey: 'availabilityStepValid',
  stepValidateKey: 'availabilityStepValidate'
})

function onOptionIdUpdate(id: string | null): void {
  ;(o.selectedOptionTypeBlockId as Ref<string | null>).value = id
}
</script>

<template>
  <div class="availability-step">
    <VRow class="calendar-grid-row">
      <VCol cols="12" class="position-relative overflow-visible">
        <div class="d-flex align-center justify-space-between flex-wrap mb-2">
          <div>
            <h4 class="text-h4 mb-2">Appointment Availability</h4>
            <p class="text-body-2 mb-6 mb-sm-4">Select a time that works for everybody</p>
          </div>
        </div>
      </VCol>

      <VCol v-if="o.firstAvailableNotice" cols="12" class="pt-0 pb-2">
        <VAlert
          type="info"
          variant="tonal"
          closable
          density="compact"
          class="first-available-notice"
          @click:close="o.clearFirstAvailableNotice"
        >
          {{ o.firstAvailableNotice }}
        </VAlert>
      </VCol>

      <VCol cols="12" class="calendar-col">
        <AvailabilityCalendarSection
          :model-value="o.selectedDateSingle.value"
          :display-date="o.vDatePickerDisplayDate.value"
          :min="o.getTodayDate()"
          :allowed-dates="o.allowedDates.value"
          :selected-date-error="o.fieldErrors.value?.selectedDate"
          :is-effectively-differential="o.isEffectivelyDifferential.value"
          :graph-bars="o.graphBars.value"
          :selected-services="o.wizard.selectedServiceTypeBlocks.value"
          :perspective="o.perspective.value"
          @update:model-value="o.handleDateChange($event)"
          @update:display-date="o.setVDatePickerDisplayDate($event)"
          @time-basis-change="o.handleTimeBasisChange"
        />
      </VCol>

      <VCol cols="12" class="time-selection-col">
        <div class="time-selection-content">
          <template v-if="o.selectedDate.value?.start">
            <div v-if="o.appointmentSlots.value.length === 0" class="text-body-2 text-medium-emphasis py-4 mb-4 mb-sm-6">
              {{ o.emptyStateMessage }}
            </div>
            <AppointmentSlotGrid
              v-else
              :appointment-slots="o.appointmentSlots.value"
              :selected-button-index="o.selectedButtonIndex.value"
              :time-basis="o.perspective.value"
              :color="o.slotColor.value"
              class="appointment-slot-grid-abut"
              @slot-click="o.handleAppointmentSlotClick"
            />
            <div v-if="o.fieldErrors.value?.selectedTimeSlot" class="text-error text-caption mt-2 mb-2">
              {{ o.fieldErrors.value?.selectedTimeSlot }}
            </div>
          </template>
          <template v-else>
            <div class="d-flex align-center justify-start date-placeholder">
              <p class="text-body-1 text-medium-emphasis">Select a date from the calendar to see available time slots</p>
            </div>
          </template>

          <AvailabilityOptionsSection
            :has-selected-services="o.wizard.selectedServiceTypeBlocks.value.length > 0"
            :cascade-error="o.wizard.availabilityOptionsCascadeError?.value ?? null"
            :available-option-type-blocks="o.wizard.availableOptionTypeBlocks.value"
            :selected-option-type-block-id="o.selectedOptionTypeBlockId.value"
            @update:selected-option-type-block-id="onOptionIdUpdate"
          />
        </div>
      </VCol>
    </VRow>

    <MoveablePartsModal
      :show-modal="o.showMoveableModal.value"
      :moveable-options="o.moveableOptions.value"
      :selected-slot-index="o.selectedMoveableSlotIndex.value"
      :contingency-period="o.contingencyPeriod.value"
      :is-loading-options="o.isLoadingOptions.value"
      @update:show-modal="o.showMoveableModal.value = $event"
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
</style>
