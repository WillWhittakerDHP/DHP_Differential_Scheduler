<!--
  Shared sub-step content: calendar, tailor (options + contingency), graph, slots, moveable completion.
  Used in VExpansionPanelText (accordion) and section content.
  Task 6.9.4.1: Step 4 is completion slots only; contingency lives in step 1 when moveable + preClosing.
-->
<script setup lang="ts">
import { inject, computed, watch } from 'vue'
import { availabilitySubStepContextKey } from '@/keys/bookingInjectionKeys'
import { AVAILABILITY_SUBSTEP_UI } from '@/constants/availabilityStepConstants'
import SlotGridWithOverlay from '@/components/booking/steps/SlotGridWithOverlay.vue'
import type { ContingencyPeriod } from '@/types/moveableScheduling'
import {
  clampContingencyDeadlineToEarliest,
  minContingencyDateKeyFromEarliest,
  minContingencyTimeForDate,
  parseContingencyDeadlineLocalWallToUtcMs,
} from '@/utils/booking/clampContingencyDeadlineToEarliest'
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

/** Writable bridge for contingencyPeriod (Ref) so v-model works; clamps deadline to earliest moveable start. */
function updateContingency(partial: Partial<ContingencyPeriod>): void {
  const o = ctx!.o
  let next: ContingencyPeriod = { ...o.contingencyPeriod.value, ...partial }
  const win = o.moveableSchedulingWindow.value
  if (win?.earliestStart && next.hasContingency === true && next.endDate && next.endTime) {
    const c = clampContingencyDeadlineToEarliest(next.endDate, next.endTime, win.earliestStart)
    next = { ...next, endDate: c.endDate, endTime: c.endTime }
  }
  o.contingencyPeriod.value = next
}

/** Yes/No only — clears deadline fields when user chooses No. */
function onContingencyChoice(value: boolean): void {
  const o = ctx!.o
  const cur = o.contingencyPeriod.value
  if (value === false) {
    o.contingencyPeriod.value = {
      ...cur,
      hasContingency: false,
      endDate: null,
      endTime: null,
    }
    return
  }
  o.contingencyPeriod.value = { ...cur, hasContingency: true }
}

/** Task 6.9.4.1: Step 4 moveable computeds. */
const step4HasClosingDate = computed(
  () =>
    ctx!.o.contingencyPeriod.value.hasContingency === true &&
    Boolean(ctx!.o.contingencyPeriod.value.endDate && ctx!.o.contingencyPeriod.value.endTime)
)

const hasOptions = computed(() => ctx!.hasOptions.value)

/** Min date/time from selected inspection slot + buffer (Step 3+); omit min until slot picked. */
const contingencyDeadlineMinDate = computed(() => {
  const es = ctx!.o.moveableSchedulingWindow.value?.earliestStart
  return es ? minContingencyDateKeyFromEarliest(es) : undefined
})

const contingencyDeadlineMinTime = computed(() => {
  const win = ctx!.o.moveableSchedulingWindow.value
  const endDate = ctx!.o.contingencyPeriod.value.endDate
  if (!win?.earliestStart || !endDate) return undefined
  return minContingencyTimeForDate(endDate, win.earliestStart)
})

/** Pass min on component attrs so Vuetify forwards it to the native date/time input (not a declared prop). */
const deadlineDateNativeAttrs = computed(() => {
  const min = contingencyDeadlineMinDate.value
  return min !== undefined && min !== '' ? { min } : {}
})

const deadlineTimeNativeAttrs = computed(() => {
  const min = contingencyDeadlineMinTime.value
  const minutes = ctx!.o.availabilityMinuteIncrement.value
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 15
  /** HTML `step` on `input type="time"` is in seconds; matches admin grid increment. */
  const stepSeconds = safeMinutes * 60
  return {
    step: stepSeconds,
    ...(min !== undefined && min !== '' ? { min } : {}),
  }
})

/** Full YYYY-MM-DD only — avoids clobbering partial input while typing. */
function coerceDeadlineDateInput(raw: unknown): string | null {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return null
  const minD = contingencyDeadlineMinDate.value
  if (minD && s.length === 10 && s < minD) return minD
  return s
}

/** Full HH:mm only when on min date — avoids fighting incomplete time input. */
function coerceDeadlineTimeInput(raw: unknown): string | null {
  const t = typeof raw === 'string' ? raw.trim() : ''
  if (!t) return null
  const minT = contingencyDeadlineMinTime.value
  const endDate = ctx!.o.contingencyPeriod.value.endDate
  const minD = contingencyDeadlineMinDate.value
  if (
    minT !== undefined &&
    endDate &&
    minD &&
    endDate === minD &&
    t.length >= 5 &&
    t < minT
  ) {
    return minT
  }
  return t
}

function onDeadlineDateModelUpdate(raw: unknown): void {
  updateContingency({ endDate: coerceDeadlineDateInput(raw) })
}

function onDeadlineTimeModelUpdate(raw: unknown): void {
  updateContingency({ endTime: coerceDeadlineTimeInput(raw) })
}

/** Stepper navigates canonical UTC day keys that have ≥1 slot after moveable window filter. */
const step4MoveableDayIndex = computed(() => {
  const keys = ctx!.o.availableMoveableDayKeys.value
  const day = ctx!.o.selectedMoveableDay.value
  if (!day) return -1
  return keys.indexOf(day)
})

const step4CanStepPrev = computed(() => step4MoveableDayIndex.value > 0)

const step4CanStepNext = computed(() => {
  const keys = ctx!.o.availableMoveableDayKeys.value
  const i = step4MoveableDayIndex.value
  return i >= 0 && i < keys.length - 1
})

/** Contingency + deadline collected in Tailor (step 1); step 4 only picks completion slot or auto-confirms No. */
const step4CanConfirm = computed(() => {
  const o = ctx!.o
  const opts = o.moveableOptions.value
  if (!opts) return false
  const h = o.contingencyPeriod.value.hasContingency
  if (h === false) return true
  if (!step4HasClosingDate.value) return false
  const slots = o.moveableAppointmentSlots.value
  if (slots.length === 0) return false
  return o.selectedMoveableSlotIndex.value !== null
})

function step4StepDay(delta: -1 | 1): void {
  const keys = ctx!.o.availableMoveableDayKeys.value
  const i = step4MoveableDayIndex.value
  if (i < 0) return
  const nextIdx = i + delta
  if (nextIdx < 0 || nextIdx >= keys.length) return
  const nextDay = keys[nextIdx]
  if (nextDay !== undefined) {
    ctx!.o.setSelectedMoveableDay(nextDay)
  }
}

/** On slot click: select slot and confirm (same pattern as step 3 — direct confirm). */
function handleMoveableSlotClick(buttonIndex: number): void {
  ctx!.o.selectMoveableSlot(buttonIndex)
  ctx!.handleMoveableConfirmWithConfirm()
}

/** Auto-confirm when moveable step is valid; removes need for explicit Confirm/Cancel buttons.
 * No-contingency path confirms without step4HasClosingDate; Yes path waits for deadline + slot load.
 * WHY: Exclude loading states so we don't collapse before user can interact. */
watch(
  () =>
    props.stepIndex === 4 &&
    step4CanConfirm.value &&
    !ctx!.o.stepData.value?.moveableScheduling &&
    !ctx!.o.isLoadingOptions.value &&
    !(step4HasClosingDate.value && ctx!.o.isLoadingMoveableDaySlots.value),
  (shouldAutoConfirm) => {
    if (shouldAutoConfirm) ctx!.handleMoveableConfirmWithConfirm()
  },
  { immediate: true }
)

/** If inspection/buffer changes, pull contingency deadline forward when it was before earliest start. */
watch(
  () => ctx!.o.moveableSchedulingWindow.value?.earliestStart ?? null,
  (earliest) => {
    if (!earliest) return
    const o = ctx!.o
    const c = o.contingencyPeriod.value
    if (c.hasContingency !== true || !c.endDate || !c.endTime) return
    const clamped = clampContingencyDeadlineToEarliest(c.endDate, c.endTime, earliest)
    const beforeMs = parseContingencyDeadlineLocalWallToUtcMs(c.endDate, c.endTime)
    const afterMs = parseContingencyDeadlineLocalWallToUtcMs(clamped.endDate, clamped.endTime)
    const deadlineUnchanged =
      (beforeMs === null && afterMs === null) ||
      (beforeMs !== null && afterMs !== null && beforeMs === afterMs)
    if (!deadlineUnchanged) {
      o.contingencyPeriod.value = { ...c, endDate: clamped.endDate, endTime: clamped.endTime }
    }
  }
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
              <VTextField
                :model-value="ctx.o.contingencyPeriod.value.endTime"
                :label="AVAILABILITY_SUBSTEP_UI.DEADLINE_TIME"
                type="time"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                v-bind="deadlineTimeNativeAttrs"
                @update:model-value="onDeadlineTimeModelUpdate"
              />
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
