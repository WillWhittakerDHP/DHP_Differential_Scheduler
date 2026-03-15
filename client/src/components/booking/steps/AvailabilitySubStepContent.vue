<!--
  Shared sub-step content: calendar, options, graph, slots, moveable.
  Used in VExpansionPanelText (accordion) and section content.
  Task 6.9.4.1: Step 4 moveable content (contingency + completion times) in-step.
-->
<script setup lang="ts">
import { inject, computed, watch } from 'vue'
import { availabilitySubStepContextKey } from '@/composables/booking/injectionKeys'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import SlotGridWithOverlay from '@/components/booking/steps/SlotGridWithOverlay.vue'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'
import DifferentialGraph from '@/components/booking/DifferentialGraph.vue'
import AvailabilityCalendarSection from '@/components/booking/steps/AvailabilityCalendarSection.vue'
import AvailabilityOptionsSection from '@/components/booking/steps/AvailabilityOptionsSection.vue'

interface Props {
  stepIndex: number
}
const props = defineProps<Props>()

const ctx = inject(availabilitySubStepContextKey)
if (!ctx) {
  throw new Error('AvailabilitySubStepContent must be used inside AvailabilityStep')
}

/** Task 6.9.4.1: Moveable step 4 helpers (same logic as MoveablePartsModal). */
function parseDayKey(day: string): Date {
  return new Date(`${day}T00:00:00Z`)
}

function addDays(day: string, delta: number): string {
  const date = parseDayKey(day)
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

/** Writable bridge for contingencyPeriod (Ref) so v-model works. */
function updateContingency(partial: Partial<ContingencyPeriod>): void {
  const o = ctx!.o
  o.contingencyPeriod.value = { ...o.contingencyPeriod.value, ...partial }
}

/** Task 6.9.4.1: Step 4 moveable computeds (mirror MoveablePartsModal). */
const step4HasClosingDate = computed(
  () =>
    ctx!.o.contingencyPeriod.value.hasContingency &&
    Boolean(ctx!.o.contingencyPeriod.value.endDate)
)

const step4InnerDayKey = computed(
  () => ctx!.o.moveableOptions.value?.innerBoundary?.slice(0, 10) ?? null
)
const step4OuterDayKey = computed(
  () => ctx!.o.moveableOptions.value?.outerBoundary?.slice(0, 10) ?? null
)

const step4CanStepPrev = computed(() => {
  const day = ctx!.o.selectedMoveableDay.value
  const inner = step4InnerDayKey.value
  if (!day || !inner) return false
  const prev = addDays(day, -1)
  return prev >= inner && ctx!.o.allowedMoveableDates.value(prev)
})

const step4CanStepNext = computed(() => {
  const day = ctx!.o.selectedMoveableDay.value
  const outer = step4OuterDayKey.value
  if (!day || !outer) return false
  const next = addDays(day, 1)
  return next <= outer && ctx!.o.allowedMoveableDates.value(next)
})

const step4SelectedMoveableDayLabel = computed(() => {
  const day = ctx!.o.selectedMoveableDay.value
  if (!day) return AVAILABILITY_SUBSTEP_UI.NO_DAY_SELECTED
  const d = parseDayKey(day)
  const today = new Date()
  const todayKey = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const tomorrowKey = new Date(todayKey)
  tomorrowKey.setUTCDate(todayKey.getUTCDate() + 1)
  if (d.getTime() === todayKey.getTime()) return AVAILABILITY_SUBSTEP_UI.TODAY
  if (d.getTime() === tomorrowKey.getTime()) return AVAILABILITY_SUBSTEP_UI.TOMORROW
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const step4CanConfirm = computed(() => {
  const o = ctx!.o
  const opts = o.moveableOptions.value
  if (!opts) return false
  if (!step4HasClosingDate.value) return true
  if (o.moveableAppointmentSlots.value.length === 0) return true
  return o.selectedMoveableSlotIndex.value !== null
})

function step4StepDay(delta: -1 | 1): void {
  const day = ctx!.o.selectedMoveableDay.value
  if (!day) return
  const next = addDays(day, delta)
  if (ctx!.o.allowedMoveableDates.value(next)) {
    ctx!.o.setSelectedMoveableDay(next)
  }
}

/** On slot click: select slot and confirm (same pattern as step 3 — direct confirm). */
function handleMoveableSlotClick(buttonIndex: number): void {
  ctx!.o.selectMoveableSlot(buttonIndex)
  ctx!.handleMoveableConfirmWithConfirm()
}

/** Auto-confirm when moveable step is valid; removes need for explicit Confirm/Cancel buttons.
 * Requires step4HasClosingDate so we don't confirm before user sets a deadline.
 * WHY: Exclude loading states so we don't collapse before user can interact. */
watch(
  () =>
    props.stepIndex === 4 &&
    step4HasClosingDate.value &&
    step4CanConfirm.value &&
    !ctx!.o.stepData.value?.moveableScheduling &&
    !ctx!.o.isLoadingOptions.value &&
    !ctx!.o.isLoadingMoveableDaySlots.value,
  (shouldAutoConfirm) => {
    if (shouldAutoConfirm) ctx!.handleMoveableConfirmWithConfirm()
  },
  { immediate: true }
)
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
        :color="ctx.o.slotColor.value"
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
  <!-- Step 4: Confirm moveable details (Task 6.9.4.1). Title shown in accordion header (step.label). -->
  <div v-else-if="stepIndex === 4" class="availability-step-5-slot moveable-content">
    <div v-if="ctx.o.isLoadingOptions.value" class="text-center py-8">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-4">{{ AVAILABILITY_SUBSTEP_UI.CALCULATING_TIMES }}</div>
    </div>

    <div v-else>
      <!-- Section 1: Contingency Questions -->
      <div class="mb-6">
        <h3 class="text-headline-small mb-4">{{ AVAILABILITY_SUBSTEP_UI.CONTINGENCY_DEADLINE }}</h3>
        <p class="mb-4 text-body-medium">
          {{ AVAILABILITY_SUBSTEP_UI.CONTINGENCY_QUESTION }}
        </p>

        <VRadioGroup
          :model-value="ctx.o.contingencyPeriod.value.hasContingency"
          inline
          class="mb-4"
          @update:model-value="updateContingency({ hasContingency: $event ?? false })"
        >
          <VRadio :label="AVAILABILITY_SUBSTEP_UI.CONTINGENCY_YES" :value="true" />
          <VRadio :label="AVAILABILITY_SUBSTEP_UI.CONTINGENCY_NO" :value="false" />
        </VRadioGroup>

        <VExpandTransition>
          <div v-if="ctx.o.contingencyPeriod.value.hasContingency" class="mt-4">
            <VRow>
              <VCol cols="6">
                <VTextField
                  :model-value="ctx.o.contingencyPeriod.value.endDate"
                  :label="AVAILABILITY_SUBSTEP_UI.DEADLINE_DATE"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="updateContingency({ endDate: $event })"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  :model-value="ctx.o.contingencyPeriod.value.endTime"
                  :label="AVAILABILITY_SUBSTEP_UI.DEADLINE_TIME"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="updateContingency({ endTime: $event })"
                />
              </VCol>
            </VRow>
          </div>
        </VExpandTransition>
      </div>

      <VDivider class="my-6" />

      <!-- Section 2: Available Completion Times -->
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
            <span class="moveable-day-stepper__label">{{ step4SelectedMoveableDayLabel }}</span>
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

        <VAlert v-else type="warning" variant="tonal">
          {{ AVAILABILITY_SUBSTEP_UI.NO_SLOTS_FOR_DAY }}
          {{ AVAILABILITY_SUBSTEP_UI.NO_SLOTS_HINT }}
        </VAlert>
      </div>
      <div v-else-if="ctx.o.moveableOptions.value && !step4HasClosingDate" class="text-body-medium text-medium-emphasis">
        {{ AVAILABILITY_SUBSTEP_UI.PROVIDE_DEADLINE }}
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
