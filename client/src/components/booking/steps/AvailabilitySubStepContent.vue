<!--
  Shared sub-step content: calendar, tailor (options + contingency), graph, slots, moveable completion.
  Used in VExpansionPanelText (accordion) and section content.
  Task 6.9.4.1: Step 4 is completion slots only; contingency lives in step 1 when moveable + preClosing.
-->
<script setup lang="ts">
import { inject, toRef } from 'vue'
import { availabilitySubStepContextKey } from '@/keys/bookingInjectionKeys'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import SlotGridWithOverlay from '@/components/booking/steps/SlotGridWithOverlay.vue'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'
import AvailabilityCalendarSection from '@/components/booking/steps/AvailabilityCalendarSection.vue'
import AvailabilityOptionsSection from '@/components/booking/steps/AvailabilityOptionsSection.vue'
import { useAvailabilitySubStepContent } from '@/composables/booking/useAvailabilitySubStepContent'

interface Props {
  stepIndex: number
}
const props = defineProps<Props>()

const ctx = inject(availabilitySubStepContextKey)
if (!ctx) {
  throw new Error('AvailabilitySubStepContent must be used inside AvailabilityStep')
}

const stepIndexRef = toRef(props, 'stepIndex')

const {
  onContingencyChoice,
  onDeadlineDateModelUpdate,
  onDeadlineTimeModelUpdate,
  contingencyDeadlineMinTime,
  deadlineDateNativeAttrs,
  allowedDeadlineMinutes,
  deadlineTimeMenuOpen,
  step4HasClosingDate,
  hasOptions,
  step4CanStepPrev,
  step4CanStepNext,
  step4StepDay,
  handleMoveableSlotClick,
} = useAvailabilitySubStepContent(ctx, stepIndexRef)
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
  <!-- Step 1: Tailor — cascade options (if any) + contingency when moveable + preClosing -->
  <div v-else-if="stepIndex === 1" class="availability-options-below-calendar">
    <AvailabilityOptionsSection
      v-if="hasOptions"
      :has-selected-services="ctx.o.wizard.selectedServiceTypeBlocks.value.length > 0"
      :cascade-error="ctx.o.wizard.availabilityOptionsCascadeError?.value ?? null"
      :available-option-type-blocks="ctx.o.wizard.availableOptionTypeBlocks.value"
      :selected-option-type-block-id="ctx.o.selectedOptionTypeBlockId.value"
      :selected-user-type-block-instance-id="ctx.o.wizard.selectedUserTypeBlock.value?.id ?? null"
      @update:selected-option-type-block-id="ctx.onOptionIdUpdate"
    />

    <div v-if="ctx.o.hasMoveablePartsGated.value" :class="hasOptions ? 'mt-6' : ''">
      <VDivider v-if="hasOptions" class="mb-6" />
      <h3 class="text-headline-small mb-4">{{ AVAILABILITY_SUBSTEP_UI.CONTINGENCY_DEADLINE }}</h3>
      <p class="mb-4 text-body-medium">
        {{ AVAILABILITY_SUBSTEP_UI.CONTINGENCY_QUESTION }}
      </p>

      <VRadioGroup
        :model-value="ctx.o.contingencyPeriod.value.hasContingency"
        inline
        class="mb-4"
        @update:model-value="onContingencyChoice($event as boolean)"
      >
        <VRadio :label="AVAILABILITY_SUBSTEP_UI.CONTINGENCY_YES" :value="true" />
        <VRadio :label="AVAILABILITY_SUBSTEP_UI.CONTINGENCY_NO" :value="false" />
      </VRadioGroup>

      <VExpandTransition>
        <div v-if="ctx.o.contingencyPeriod.value.hasContingency === true" class="mt-4">
          <VRow>
            <VCol cols="6">
              <VTextField
                :model-value="ctx.o.contingencyPeriod.value.endDate"
                :label="AVAILABILITY_SUBSTEP_UI.DEADLINE_DATE"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                v-bind="deadlineDateNativeAttrs"
                @update:model-value="onDeadlineDateModelUpdate"
              />
            </VCol>
            <VCol cols="6">
              <VMenu
                v-model="deadlineTimeMenuOpen"
                :close-on-content-click="false"
                location="bottom start"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    :model-value="ctx.o.contingencyPeriod.value.endTime"
                    :label="AVAILABILITY_SUBSTEP_UI.DEADLINE_TIME"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    readonly
                    v-bind="menuProps"
                  />
                </template>
                <VTimePicker
                  :model-value="ctx.o.contingencyPeriod.value.endTime"
                  :allowed-minutes="allowedDeadlineMinutes"
                  :min="contingencyDeadlineMinTime"
                  format="ampm"
                  @update:model-value="(v: string | null) => { onDeadlineTimeModelUpdate(v); deadlineTimeMenuOpen = false }"
                />
              </VMenu>
            </VCol>
          </VRow>
        </div>
      </VExpandTransition>
    </div>
  </div>
  <!-- Step 3: Pick a time (graph at top when differential, then slots) -->
  <div v-else-if="stepIndex === 3" class="time-selection-content">
    <DifferentialGraph
      v-if="ctx.o.isEffectivelyDifferential.value"
      :is-differential-service="ctx.o.isEffectivelyDifferential.value"
      :graph-bars="ctx.o.graphBars.value"
      :selected-services="ctx.o.wizard.selectedServiceTypeBlocks.value"
      :start-time-type="ctx.o.perspective.value"
      class="differential-graph-above-slots"
      @time-basis-change="ctx.handleTimeBasisChangeWithConfirm"
    />
    <template v-if="ctx.o.selectedDate.value?.start">
      <div v-if="ctx.o.appointmentSlots.value.length === 0" class="text-body-medium text-medium-emphasis py-4 mb-4 mb-sm-6">
        {{ ctx.emptyStateMessage }}
      </div>
      <SlotGridWithOverlay
        v-else
        :appointment-slots="ctx.o.appointmentSlots.value"
        :selected-button-index="ctx.o.selectedButtonIndex.value"
        :time-basis="ctx.o.perspective.value"
        :show-slots-overlay="ctx.showSlotsOverlay"
        :slot-grid-overlay-label="ctx.slotGridOverlayLabel"
        :slot-grid-overlay-error="ctx.slotGridOverlayError"
        @slot-click="ctx.handleSlotClickWithConfirm"
      />
      <div v-if="ctx.o.fieldErrors.value?.selectedTimeSlot" class="text-error text-body-small mt-2 mb-2">
        {{ ctx.o.fieldErrors.value?.selectedTimeSlot }}
      </div>
    </template>
    <div v-else class="d-flex align-center justify-start date-placeholder">
      <p class="text-body-large text-medium-emphasis">{{ AVAILABILITY_SUBSTEP_UI.SELECT_DATE_PLACEHOLDER }}</p>
    </div>
  </div>
  <!-- Step 4: Completion times only (contingency in Tailor / step 1). -->
  <div v-else-if="stepIndex === 4" class="availability-step-5-slot moveable-content">
    <div v-if="ctx.o.isLoadingOptions.value" class="text-center py-8">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-4">{{ AVAILABILITY_SUBSTEP_UI.CALCULATING_TIMES }}</div>
    </div>

    <div v-else>
      <div v-if="ctx.o.moveableOptions.value && step4HasClosingDate" class="moveable-completion-section">
        <h3 class="text-headline-small mb-4">{{ AVAILABILITY_SUBSTEP_UI.AVAILABLE_COMPLETION_TIMES }}</h3>

        <div class="mb-4">
          <p class="text-body-medium mb-2">{{ AVAILABILITY_SUBSTEP_UI.CHOOSE_DAY }}</p>
          <div class="moveable-day-stepper">
            <VBtn
              variant="text"
              density="comfortable"
              :disabled="!step4CanStepPrev"
              aria-label="Previous day"
              @click="step4StepDay(-1)"
            >
              {{ AVAILABILITY_SUBSTEP_UI.PREV }}
            </VBtn>
            <span class="moveable-day-stepper__label">{{ ctx.o.moveableStepperDayLabel.value }}</span>
            <VBtn
              variant="text"
              density="comfortable"
              :disabled="!step4CanStepNext"
              aria-label="Next day"
              @click="step4StepDay(1)"
            >
              {{ AVAILABILITY_SUBSTEP_UI.NEXT }}
            </VBtn>
          </div>
        </div>

        <p class="text-body-medium mb-4">
          {{ AVAILABILITY_SUBSTEP_UI.SELECT_COMPLETION_TIME }}
        </p>

        <VAlert
          v-if="ctx.moveableInfeasible"
          type="error"
          variant="tonal"
          class="mb-4"
          role="alert"
        >
          {{ ctx.moveableInfeasibleMessage }}
        </VAlert>

        <div v-if="ctx.o.isLoadingMoveableDaySlots.value" class="text-center py-4">
          <VProgressCircular indeterminate color="primary" size="24" />
          <span class="ml-2 text-body-small">{{ AVAILABILITY_SUBSTEP_UI.LOADING_DAY_SLOTS }}</span>
        </div>

        <div
          v-else-if="ctx.o.moveableAppointmentSlots.value.length > 0"
          class="moveable-slot-grid-wrapper position-relative"
        >
          <AppointmentSlotGrid
            :appointment-slots="ctx.o.moveableAppointmentSlots.value"
            :selected-button-index="ctx.o.selectedMoveableSlotIndex.value"
            time-basis="nonDifferential"
            color="primary"
            class="appointment-slot-grid-abut mb-4"
            @slot-click="handleMoveableSlotClick"
          />
        </div>

        <VAlert v-else-if="!ctx.moveableInfeasible" type="warning" variant="tonal">
          {{ AVAILABILITY_SUBSTEP_UI.NO_SLOTS_FOR_DAY }}
          {{ AVAILABILITY_SUBSTEP_UI.NO_SLOTS_HINT }}
        </VAlert>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.first-available-notice {
  font-size: 0.8125rem;
}

.moveable-slot-grid-wrapper {
  position: relative;
}

.moveable-day-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
}

.moveable-day-stepper__label {
  font-weight: 600;
}
</style>
