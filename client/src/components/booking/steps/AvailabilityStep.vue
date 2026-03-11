<script setup lang="ts">

import { inject, computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { createLogger } from '@/utils/logger'
import { wizardKey } from '@/composables/booking/injectionKeys'
import { useAvailabilityOrchestrator } from '@/composables/booking/useAvailabilityOrchestrator'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import { useAvailabilitySubSteps } from '@/composables/booking/useAvailabilitySubSteps'
import { useAvailabilityConfirmationState } from '@/composables/booking/useAvailabilityConfirmationState'
import { useAvailabilityStepUI } from '@/composables/booking/useAvailabilityStepUI'
import { useAvailabilityStepSlotOverlay } from '@/composables/booking/useAvailabilityStepSlotOverlay'
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
import AvailabilitySubStepHeader from '@/components/booking/steps/AvailabilitySubStepHeader.vue'
import AvailabilitySubStepContent from '@/components/booking/steps/AvailabilitySubStepContent.vue'
import { availabilitySubStepContextKey } from '@/composables/booking/injectionKeys'

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

const confirmation = useAvailabilityConfirmationState()
const { settings: availabilitySettings, isLoading: availabilitySettingsLoading } = useAvailabilitySettings()

const ui = useAvailabilityStepUI({ o, availabilitySettings, confirmation })
const overlay = useAvailabilityStepSlotOverlay({ o, availabilitySettings })

const logger = createLogger('AvailabilityStep')

watch(
  [overlay.showSlotsOverlay, overlay.slotGridOverlayLabel, availabilitySettingsLoading],
  ([showing, label, loading]) => {
    if (!loading && showing && !label) {
      logger.warn('Slot grid overlay is shown but differentialGraphDefaultLabel is missing. Configure in Admin → Business Controls → Calendar → Grid.')
    }
  },
  { immediate: true }
)

const hasOptions = computed(() => (o.wizard.availableOptionTypeBlocks.value?.length ?? 0) > 0)
const hasDateSelected = computed(() => !!o.selectedDate.value?.start)
const hasSlotSelected = computed(() => o.selectedButtonIndex.value != null)
const hasMoveableConfirmed = computed(() => !!o.stepData.value?.moveableScheduling)

const subSteps = useAvailabilitySubSteps({
  hasOptions,
  hasDateSelected,
  isEffectivelyDifferential: o.isEffectivelyDifferential,
  hasMoveablePartsGated: o.hasMoveablePartsGated,
  selectedOptionTypeBlockId: o.selectedOptionTypeBlockId,
  userHasChosenTimeBasisFromGraph: computed(() => !!o.userHasChosenTimeBasisFromGraph?.value),
  hasSlotSelected,
  hasMoveableConfirmed,
  confirmationState: confirmation,
  subStepLabels: ui.subStepLabels,
})

/** Visible sub-steps (filter to only visible). */
const visibleSubStepsFiltered = computed(() =>
  subSteps.visibleSubSteps.value.filter((s) => s.visible)
)
/** Single expanded panel index for accordion; strictly driven by current step (one-way).
 * Task 6.9.2.2: Auto-expand on confirm — when user confirms a sub-step, currentStepIndex advances
 * (via useAvailabilitySubSteps + confirmationState), this watcher syncs narrowExpanded, and the
 * next panel opens (accordion collapses previous). Sub-step state (currentStepIndex, completedStepIndices)
 * is explicit for 6.9.3 (a11y) and 6.9.4 (5th content). */
const narrowExpanded = ref<number>(0)
/** Current step index for template (nested ref not auto-unwrapped). */
const currentStepIndexValue = computed(() => subSteps.currentStepIndex.value)
watch(
  currentStepIndexValue,
  (idx) => {
    narrowExpanded.value = idx
  }
)
/** Loaded appointment with availability data — keep step 4 open for confirmation review. */
const hasLoadedAvailability = computed(
  () =>
    (loadedWizardState?.value?.availability?.candidateDate != null) ||
    (loadedWizardState?.value?.availability?.candidateTimeSlots != null)
)

/** Accept user click or programmatic sync. User can expand any panel (e.g. to review a previous step). */
function onExpandedChange(expandedIndex: number): void {
  narrowExpanded.value = expandedIndex
}
/** Task 6.9.3.1: Keyboard handler for Enter/Space on headers. Toggle expand/collapse per WAI-ARIA accordion. */
function onHeaderKeydown(stepIndex: number): void {
  const next = narrowExpanded.value === stepIndex ? -1 : stepIndex
  onExpandedChange(next)
}

/** Task 6.9.3.3: Focus first focusable element in content region. Used when expanding a panel.
 * WHY: For step 3 (Pick a time) and step 4 (Confirm moveable), prefer first available slot button.
 * WHY: scrollIntoView ensures the first slot is visible when the grid opens (e.g. in accordion). */
function focusFirstFocusableInContent(stepIndex: number): void {
  nextTick(() => {
    const contentEl = document.getElementById(`availability-substep-content-${stepIndex}`)
    if (!contentEl) return
    const slotStep = stepIndex === 3 || stepIndex === 4
    const firstSlot = slotStep
      ? contentEl.querySelector<HTMLElement>('.appointment-slot-btn:not([disabled])')
      : null
    const focusable = firstSlot ?? contentEl.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
    if (focusable) {
      focusable.focus()
      focusable.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

/** Task 6.9.3.3: Focus the header button. Used when collapsing a panel. */
function focusHeader(stepIndex: number): void {
  const headerEl = document.getElementById(`availability-substep-title-${stepIndex}`)
  ;(headerEl as HTMLElement | null)?.focus()
}

/** Task 6.9.3.3: Focus management — on expand focus content, on collapse focus header. No focus trap. */
watch(
  narrowExpanded,
  (newVal, oldVal) => {
    if (newVal >= 0) {
      focusFirstFocusableInContent(newVal)
    } else if (oldVal >= 0) {
      focusHeader(oldVal)
    }
  },
  { flush: 'post' }
)

/** Context for AvailabilitySubStepContent (inject). Task 6.9.4.1: handleMoveableConfirmWithConfirm for step 4. */
const subStepContext = {
  o,
  handleDateChangeWithConfirm: ui.handleDateChangeWithConfirm,
  onOptionIdUpdate: ui.onOptionIdUpdate,
  handleTimeBasisChangeWithConfirm: ui.handleTimeBasisChangeWithConfirm,
  handleSlotClickWithConfirm: ui.handleSlotClickWithConfirm,
  handleMoveableConfirmWithConfirm: ui.handleMoveableConfirmWithConfirm,
  get showSlotsOverlay() {
    return overlay.showSlotsOverlay.value
  },
  get slotGridOverlayLabel() {
    return overlay.slotGridOverlayLabel.value
  },
  get slotGridOverlayError() {
    return overlay.slotGridOverlayError.value
  },
  get emptyStateMessage() {
    return o.emptyStateMessage.value ?? ''
  },
  get firstAvailableNotice() {
    return o.firstAvailableNotice?.value ?? null
  },
  clearFirstAvailableNotice: o.clearFirstAvailableNotice,
}
provide(availabilitySubStepContextKey, subStepContext)

// WHY: Set panel + reset confirmation when entering with loaded appointment so user reviews from step 0.
onMounted(() => {
  if (hasLoadedAvailability.value) {
    confirmation.reset()
  }
  nextTick(() => {
    narrowExpanded.value = currentStepIndexValue.value
  })
})
</script>

<template>
  <div class="availability-step">
    <div class="d-flex align-center justify-space-between flex-wrap mb-2">
      <div>
        <h4 class="text-headline-large mb-2">Appointment Availability</h4>
        <p class="text-body-medium mb-6 mb-sm-4">Select a time that works for everybody</p>
      </div>
    </div>

    <!-- Narrow layout: expandable cards (Task 6.9.2.1). User can expand any panel; watcher auto-expands on confirm.
         LEARNING (Task 6.9.3.1): Vuetify VExpansionPanel/VExpansionPanelTitle provide native keyboard support per
         WAI-ARIA accordion: Tab navigates between headers; Enter/Space expand/collapse. Tab order follows
         visibleSubStepsFiltered DOM order.
         LEARNING (Task 6.9.3.2): ARIA attributes so screen readers announce step position and state.
         LEARNING (Task 6.9.3.3): Focus management — watch(narrowExpanded) moves focus into content on expand,
         back to header on collapse; no focus trap.
         WHY (Task 6.9.4.5): Use visibleIdx (not step.index) for aria-label step number — step 2 is hidden, so
         visible steps can be [0,1,3,4]; step.index+1 would yield "Step 5 of 4" for the 5th panel. -->
    <VExpansionPanels
      :model-value="narrowExpanded"
      variant="accordion"
      @update:model-value="onExpandedChange"
      class="availability-step-panels"
    >
      <VExpansionPanel
        v-for="(step, visibleIdx) in visibleSubStepsFiltered"
        :key="step.index"
        :value="step.index"
        class="availability-substep-panel"
      >
        <VExpansionPanelTitle
          :id="'availability-substep-title-' + step.index"
          class="availability-substep-title"
          :aria-expanded="narrowExpanded === step.index"
          :aria-controls="'availability-substep-content-' + step.index"
          :aria-label="`Step ${visibleIdx + 1} of ${visibleSubStepsFiltered.length}: ${step.label}`"
          @keydown.enter.prevent.stop="onHeaderKeydown(step.index)"
          @keydown.space.prevent.stop="onHeaderKeydown(step.index)"
        >
          <AvailabilitySubStepHeader
            :step="step"
            :badge-state="ui.getStepBadgeState(step.index)"
            :display-summary="confirmation.isConfirmed(step.index) ? ui.getStepSummary(step.index) : null"
          />
        </VExpansionPanelTitle>
        <VExpansionPanelText
          :id="'availability-substep-content-' + step.index"
          role="region"
          :aria-labelledby="'availability-substep-title-' + step.index"
        >
          <AvailabilitySubStepContent :step-index="step.index" />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<style scoped lang="scss">
.availability-step {
  padding: 0;
}

.overflow-visible {
  overflow: visible;
}

/* Calendar/slot styles - apply via :deep to AvailabilitySubStepContent */
.availability-substep-panel :deep(.calendar-col) {
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

.slot-grid-overlay-error {
  color: rgb(var(--v-theme-error));
  font-weight: 600;
  font-size: 1rem;
  max-width: min(90vw, 420px);
}

/* Narrow layout: expandable cards (Task 6.9.2.1). Task 6.9.2.2: smooth expand/collapse transitions. */
.availability-step-panels {
  margin-bottom: 0;
  /* LEARNING: Vuetify VExpansionPanel uses internal VExpandTransition. Override duration for consistency with wizard (200–300ms). */
  --v-expand-transition-duration: 0.25s;
}

.availability-substep-panel {
  margin-bottom: 0;
}

/* Task 6.9.2.2: Ensure expansion panel content animates smoothly (Vuetify 3 uses v-expansion-panel-text__wrapper). */
.availability-step-panels :deep(.v-expansion-panel-text__wrapper) {
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;
}

/* Task 6.9.3.4: Respect prefers-reduced-motion — disable expand/collapse animations when user prefers reduced motion. */
@media (prefers-reduced-motion: reduce) {
  .availability-step-panels {
    --v-expand-transition-duration: 0s;
  }

  .availability-step-panels :deep(.v-expansion-panel-text__wrapper) {
    transition-duration: 0s;
  }
}

.availability-substep-title {
  min-height: 48px;
}

.availability-step-5-slot {
  min-height: 80px;
  display: flex;
  align-items: center;
}

/* Content styles (AvailabilitySubStepContent inside accordion) */
.availability-substep-panel :deep(.time-selection-content) {
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
.availability-substep-panel :deep(.date-placeholder) {
  min-height: 300px;
  width: 100%;
  @media (min-width: 600px) {
    min-height: 400px;
  }
}
.availability-substep-panel :deep(.slot-grid-wrapper) {
  position: relative;
  margin-top: 1rem;
}
.availability-substep-panel :deep(.slot-grid-wrapper--overlay) {
  filter: grayscale(0.5);
  opacity: 0.6;
}
.availability-substep-panel :deep(.slot-grid-overlay) {
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
.availability-substep-panel :deep(.slot-grid-overlay-text) {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
  padding: 1rem;
  @media (max-width: 599px) {
    font-size: 1.25rem;
  }
}
.availability-substep-panel :deep(.slot-grid-overlay-error) {
  color: rgb(var(--v-theme-error));
  font-weight: 600;
  font-size: 1rem;
  max-width: min(90vw, 420px);
}
.availability-substep-panel :deep(.availability-options-below-calendar) {
  margin-top: 1rem;
}
.availability-substep-panel :deep(.differential-graph-above-slots) {
  flex-shrink: 0;
}
.availability-substep-panel :deep(.appointment-slot-grid-abut) {
  margin-bottom: 0 !important;
}
</style>
