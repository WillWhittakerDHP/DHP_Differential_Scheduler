<!--
  MoveablePartsModal Component
  
  LEARNING: Modal for scheduling moveable parts (like report writing)
  WHY: Allows users to specify when moveable work should be completed, bounded by contingency deadlines
  PATTERN: VDialog with form for contingency questions and time slot selection
  
  Phase 6.4: Re-enabled. Modal opens only when (1) slot has moveable parts and (2) selected service
  has preClosing: true (gated in useAvailabilityOrchestrator via hasMoveablePartsGated).
  UX: max-width 520px, ~400ms open delay, enter/exit transitions; time grid only when closing date set.
-->
<template>
  <VDialog
    v-model="showModalDelayed"
    max-width="520"
    scrollable
    transition="scale-transition"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-headline-medium">Schedule Moveable Work</span>
        <VBtn
          icon
          variant="text"
          @click="handleCancel"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <div v-if="isLoadingOptions" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" />
          <div class="mt-4">Calculating available times...</div>
        </div>

        <div v-else>
          <!-- Section 1: Contingency Questions -->
          <div class="mb-6">
            <h3 class="text-headline-small mb-4">Contingency Deadline</h3>
            <p class="mb-4 text-body-medium">
              Do you have a deadline for when this work needs to be completed?
            </p>

            <VRadioGroup
              v-model="contingencyPeriodModel.hasContingency"
              inline
              class="mb-4"
            >
              <VRadio
                :label="'Yes'"
                :value="true"
              />
              <VRadio
                :label="'No'"
                :value="false"
              />
            </VRadioGroup>

            <VExpandTransition>
              <div v-if="contingencyPeriodModel.hasContingency" class="mt-4">
                <VRow>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="contingencyPeriodModel.endDate"
                      label="Deadline Date"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="contingencyPeriodModel.endTime"
                      label="Deadline Time"
                      type="time"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>
                </VRow>
              </div>
            </VExpandTransition>
          </div>

          <VDivider class="my-6" />

          <!-- Section 2: Available Completion Times (only when user provided closing date; Phase 6.4) -->
          <div v-if="moveableOptions && hasClosingDate">
            <h3 class="text-headline-small mb-4">Available Completion Times</h3>

            <!-- Earliest Completion Alert -->
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <VAlertTitle>Earliest Completion</VAlertTitle>
              <div>
                {{ formatEarliestCompletion(moveableOptions.earliestCompletion) }}
              </div>
            </VAlert>

            <!-- Available Slots -->
            <div v-if="moveableOptions.availableSlots.length > 0">
              <p class="mb-4 text-body-medium">
                Select when you'd like the moveable work to be completed:
              </p>

              <VList class="mb-4">
                <VListItem
                  v-for="(slot, index) in moveableOptions.availableSlots"
                  :key="index"
                  :active="selectedSlotIndex === index"
                  @click="selectSlot(index)"
                  class="cursor-pointer"
                >
                  <template #prepend>
                    <VRadio
                      :model-value="selectedSlotIndex === index"
                      @update:model-value="() => selectSlot(index)"
                    />
                  </template>
                  <VListItemTitle>{{ slot.dayLabel }}</VListItemTitle>
                  <VListItemSubtitle>{{ slot.timeLabel }}</VListItemSubtitle>
                </VListItem>
              </VList>
            </div>

            <VAlert
              v-else
              type="warning"
              variant="tonal"
            >
              No available time slots found within the specified boundaries.
              Please adjust your contingency deadline or contact support.
            </VAlert>
          </div>
          <div v-else-if="moveableOptions && !hasClosingDate" class="text-body-medium text-medium-emphasis">
            Provide a deadline date above to see available completion times.
          </div>
        </div>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="handleCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          Confirm
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ContingencyPeriod, MoveableSchedulingOptions } from '@/types/moveableScheduling'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { localTime } from '@/utils/time/localTime'

const { formatDateTimeForDisplay } = localTime()

/** Phase 6.4: ~400ms delay before opening modal so it feels less intrusive. */
const OPEN_DELAY_MS = 400

interface Props {
  showModal: boolean
  moveableOptions: MoveableSchedulingOptions | null
  selectedSlotIndex: number | null
  contingencyPeriod: ContingencyPeriod
  isLoadingOptions: boolean
}

interface Emits {
  (e: 'update:showModal', value: boolean): void
  (e: 'selectSlot', index: number): void
  (e: 'update:contingencyPeriod', value: ContingencyPeriod): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showModalModel = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
})

/** Delayed open so modal doesn't pop immediately (Phase 6.4). */
const showModalDelayedInner = ref(false)
let openTimeoutId: number | null = null
watch(showModalModel, (val) => {
  if (openTimeoutId) {
    window.clearTimeout(openTimeoutId)
    openTimeoutId = null
  }
  if (val) {
    openTimeoutId = window.setTimeout(() => {
      showModalDelayedInner.value = true
      openTimeoutId = null
    }, OPEN_DELAY_MS)
  } else {
    showModalDelayedInner.value = false
  }
}, { immediate: true })

const showModalDelayed = computed({
  get: () => showModalDelayedInner.value,
  set: (value: boolean) => {
    showModalDelayedInner.value = value
    if (!value) emit('update:showModal', false)
  }
})

/** Time grid only when user has set a closing date (Phase 6.4). */
const hasClosingDate = computed(
  () => props.contingencyPeriod.hasContingency && Boolean(props.contingencyPeriod.endDate)
)

const contingencyPeriodModel = computed({
  get: () => props.contingencyPeriod,
  set: (value: Props['contingencyPeriod']) => {
    emit('update:contingencyPeriod', { ...value })
  }
})

const canConfirm = computed(() => {
  if (!props.moveableOptions) return false
  // Phase 6.4: Passthrough — allow confirm without timeslot when no closing date set.
  if (!hasClosingDate.value) return true
  if (props.moveableOptions.availableSlots.length === 0) return true
  return props.selectedSlotIndex !== null
})

function selectSlot(index: number) {
  emit('selectSlot', index)
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

function formatEarliestCompletion(isoDate: string): string {
  return formatDateTimeForDisplay(isoDate as RFC3339DateTime, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
