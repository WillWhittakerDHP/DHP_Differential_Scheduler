<script setup lang="ts">

import { inject, computed, onMounted, provide, watch } from 'vue'
import { createLogger } from '@/utils/logger'
import { wizardKey } from '@/composables/booking/injectionKeys'
import { useAvailabilityOrchestrator } from '@/composables/booking/useAvailabilityOrchestrator'
import { useAvailabilityStepFeePreview } from '@/composables/booking/useAvailabilityStepFeePreview'
import { useWizardStepSync } from '@/composables/booking/useWizardStepSync'
import { useBooking } from '@/composables/useBooking'
import { useAvailabilitySubSteps } from '@/composables/booking/useAvailabilitySubSteps'
import { useAvailabilityConfirmationState } from '@/composables/booking/useAvailabilityConfirmationState'
import { useAvailabilityStepUI } from '@/composables/booking/useAvailabilityStepUI'
import { useAvailabilityStepSlotOverlay } from '@/composables/booking/useAvailabilityStepSlotOverlay'
import { useAvailabilityStepAccordion } from '@/composables/booking/useAvailabilityStepAccordion'
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
  bookingFlowReadyKey,
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

const isBookingFlowReady = inject(bookingFlowReadyKey)
if (!isBookingFlowReady) {
  throw new Error('bookingFlowReadyKey must be provided by useBookingWizardSetup / BookingWizard')
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
const { bookingData } = useBooking()

const ui = useAvailabilityStepUI({ o, confirmation })
const overlay = useAvailabilityStepSlotOverlay({ o })

const {
  availabilityStepPriceData,
  showFeeBar,
  feePreviewLabel,
  showApplyCoupon,
} = useAvailabilityStepFeePreview({
  wizard: o.wizard,
  propertyDetailsStepData,
  availabilityStepData: o.stepData,
  bookingData,
})

const logger = createLogger('AvailabilityStep')

watch(
  () => ({
    showingSlotsOverlay: overlay.showSlotsOverlay.value,
    slotGridLabel: overlay.slotGridOverlayLabel.value,
    bookingFlowReady: isBookingFlowReady.value,
  }),
  ({ showingSlotsOverlay, slotGridLabel, bookingFlowReady }) => {
    if (bookingFlowReady && showingSlotsOverlay && !slotGridLabel) {
      logger.warn(
        'Slot grid overlay is shown but differentialGraphDefaultLabel is missing in wizard settings. Set it under Admin → Business Controls → Calendar → Grid, then Save (wizard settings are persisted with that save).'
      )
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

const accordion = useAvailabilityStepAccordion({
  currentStepIndex: computed(() => subSteps.currentStepIndex.value),
})

/** Expanded panel index for template (unwrap ref for correct v-model/aria types). */
const expandedIndex = computed(() => accordion.expandedIndex.value)

/** Loaded appointment with availability data — keep step 4 open for confirmation review. */
const hasLoadedAvailability = computed(
  () =>
    (loadedWizardState?.value?.availability?.candidateDate != null) ||
    (loadedWizardState?.value?.availability?.candidateTimeSlots != null)
)

/** Unwrap Vuetify update:model-value (may emit value or Ref per typings). */
function onExpandedChange(val: number | { value: number }): void {
  const num = typeof val === 'object' && val !== null && 'value' in val ? (val as { value: number }).value : val
  accordion.setExpanded(num)
}

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

onMounted(() => {
  if (hasLoadedAvailability.value) {
    confirmation.reset()
  }
})
</script>

<template>
  <div class="availability-step">
    <div class="d-flex align-center justify-space-between flex-wrap mb-2">
      <div>
        <h4 class="text-headline-large mb-2">Appointment Availability</h4>
        <p class="text-body-medium mb-6 mb-sm-4">Select a time that works for everybody</p>
      </div>
      <VMenu
        v-if="showFeeBar"
        location="bottom"
        :close-on-content-click="true"
        transition="scale-transition"
        max-width="320"
      >
        <template #activator="{ props: menuProps }">
          <div
            v-bind="menuProps"
            class="text-body-large text-medium-emphasis fee-preview-bar cursor-pointer"
          >
            {{ feePreviewLabel }}
          </div>
        </template>
        <VCard class="fee-popover-card pa-3" min-width="280">
          <h6 class="text-headline-small mb-3">Price Details</h6>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-large">Bag Total</span>
              <span class="text-body-large text-medium-emphasis">
                ${{ availabilityStepPriceData.bagTotal.toFixed(2) }}
              </span>
            </div>
            <div v-if="showApplyCoupon" class="d-flex justify-space-between align-center">
              <span class="text-body-large">Coupon Discount</span>
              <span class="text-body-large text-medium-emphasis">
                {{ availabilityStepPriceData.couponDiscount > 0 ? `-$${availabilityStepPriceData.couponDiscount.toFixed(2)}` : '—' }}
              </span>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-body-large">Order Total</span>
              <span class="text-body-large text-medium-emphasis">
                ${{ availabilityStepPriceData.orderTotal.toFixed(2) }}
              </span>
            </div>
            <template v-for="(lineItem, idx) in availabilityStepPriceData.lineItems" :key="idx">
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-large">{{ lineItem.label }}</span>
                <span class="text-body-large text-medium-emphasis">
                  ${{ lineItem.amount.toFixed(2) }}
                </span>
              </div>
            </template>
          </div>
          <VDivider class="my-2" />
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-large font-weight-medium">Total</span>
            <span class="text-body-large font-weight-medium">
              ${{ availabilityStepPriceData.finalTotal.toFixed(2) }}
            </span>
          </div>
        </VCard>
      </VMenu>
    </div>

    <!-- Expandable panels (accordion). User can expand any panel; watcher auto-expands on confirm.
         LEARNING (Task 6.9.3.1): Vuetify VExpansionPanel/VExpansionPanelTitle provide native keyboard support per
         WAI-ARIA accordion: Tab navigates between headers; Enter/Space expand/collapse. Tab order follows
         visibleSubStepsFiltered DOM order.
         LEARNING (Task 6.9.3.2): ARIA attributes so screen readers announce step position and state.
         LEARNING (Task 6.9.3.3): Focus management — watch(expandedIndex) moves focus into content on expand,
         back to header on collapse; no focus trap.
         WHY (Task 6.9.4.5): Use visibleIdx (not step.index) for aria-label step number — step 2 is hidden, so
         visible steps can be [0,1,3,4]; step.index+1 would yield "Step 5 of 4" for the 5th panel. -->
    <VExpansionPanels
      :model-value="expandedIndex"
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
          :aria-expanded="expandedIndex === step.index"
          :aria-controls="'availability-substep-content-' + step.index"
          :aria-label="`Step ${visibleIdx + 1} of ${visibleSubStepsFiltered.length}: ${step.label}`"
          @keydown.enter.prevent.stop="accordion.onHeaderKeydown(step.index)"
          @keydown.space.prevent.stop="accordion.onHeaderKeydown(step.index)"
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

.availability-step-panels {
  margin-bottom: 0;
  --v-expand-transition-duration: 0.25s;
}

.availability-substep-panel {
  margin-bottom: 0;
}

.availability-step-panels :deep(.v-expansion-panel-text__wrapper) {
  transition-duration: 0.25s;
  transition-timing-function: ease-in-out;
}

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
