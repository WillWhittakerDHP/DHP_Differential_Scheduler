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
        <span class="text-headline-medium">Schedule {{ moveablePartShapeName }}</span>
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
                  <VCol cols="6">
                    <VTextField
                      v-model="contingencyPeriodModel.endDate"
                      label="Deadline Date"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>
                  <VCol cols="6">
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
          <div v-if="moveableOptions && hasClosingDate" class="moveable-completion-section">
            <h3 class="text-headline-small mb-4">Available Completion Times</h3>

            <!-- Compact day stepper for modal space. -->
            <div class="mb-4">
              <p class="text-body-medium mb-2">Choose a day</p>
              <div class="moveable-day-stepper">
                <VBtn
                  variant="text"
                  density="comfortable"
                  :disabled="!canStepPrev"
                  aria-label="Previous day"
                  @click="stepDay(-1)"
                >
                  Prev
                </VBtn>
                <span class="moveable-day-stepper__label">{{ selectedMoveableDayLabel }}</span>
                <VBtn
                  variant="text"
                  density="comfortable"
                  :disabled="!canStepNext"
                  aria-label="Next day"
                  @click="stepDay(1)"
                >
                  Next
                </VBtn>
              </div>
            </div>

            <p class="text-body-medium mb-4">
              Select when you'd like the moveable work to be completed (first option is earliest).
            </p>

            <div v-if="isLoadingMoveableDaySlots" class="text-center py-4">
              <VProgressCircular indeterminate color="primary" size="24" />
              <span class="ml-2 text-body-small">Loading times for this day...</span>
            </div>

            <!-- Same AppointmentSlotGrid; dev constraint dots are rendered by AppointmentSlotGrid in dev mode. -->
            <div v-else-if="moveableAppointmentSlots.length > 0" class="moveable-slot-grid-wrapper position-relative">
              <AppointmentSlotGrid
                :appointment-slots="moveableAppointmentSlots"
                :selected-button-index="selectedSlotIndex"
                time-basis="nonDifferential"
                color="primary"
                class="appointment-slot-grid-abut mb-4"
                @slot-click="selectSlot"
              />
            </div>

            <VAlert
              v-else
              type="warning"
              variant="tonal"
            >
              No available time slots found for this day.
              Pick another day or adjust your contingency deadline.
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
import type { AppointmentSlot } from '@/types/appointment'
import AppointmentSlotGrid from '@/components/booking/AppointmentSlotGrid.vue'

/** Phase 6.4: ~400ms delay before opening modal so it feels less intrusive. */
const OPEN_DELAY_MS = 400

interface Props {
  showModal: boolean
  moveableOptions: MoveableSchedulingOptions | null
  /** Moveable part shape name for title (e.g. "Report Writing"). */
  moveablePartShapeName: string
  /** Virtual appointment slots for selected day (same pipeline as main grid). */
  moveableAppointmentSlots: AppointmentSlot[]
  selectedMoveableDay: string | null
  allowedMoveableDates: (date: unknown) => boolean
  isLoadingMoveableDaySlots: boolean
  selectedSlotIndex: number | null
  contingencyPeriod: ContingencyPeriod
  isLoadingOptions: boolean
}

interface Emits {
  (e: 'update:showModal', value: boolean): void
  (e: 'update:selectedMoveableDay', value: string | null): void
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

const innerDayKey = computed(() => props.moveableOptions?.innerBoundary?.slice(0, 10) ?? null)
const outerDayKey = computed(() => props.moveableOptions?.outerBoundary?.slice(0, 10) ?? null)

const parseDayKey = (day: string): Date => new Date(`${day}T00:00:00Z`)

const addDays = (day: string, delta: number): string => {
  const date = parseDayKey(day)
  date.setUTCDate(date.getUTCDate() + delta)
  return date.toISOString().slice(0, 10)
}

const canStepPrev = computed(() => {
  const day = props.selectedMoveableDay
  const inner = innerDayKey.value
  if (!day || !inner) return false
  const prev = addDays(day, -1)
  return prev >= inner && props.allowedMoveableDates(prev)
})

const canStepNext = computed(() => {
  const day = props.selectedMoveableDay
  const outer = outerDayKey.value
  if (!day || !outer) return false
  const next = addDays(day, 1)
  return next <= outer && props.allowedMoveableDates(next)
})

const selectedMoveableDayLabel = computed(() => {
  const day = props.selectedMoveableDay
  if (!day) return 'No day selected'
  const d = parseDayKey(day)
  const today = new Date()
  const todayKey = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const tomorrowKey = new Date(todayKey)
  tomorrowKey.setUTCDate(todayKey.getUTCDate() + 1)
  if (d.getTime() === todayKey.getTime()) return 'Today'
  if (d.getTime() === tomorrowKey.getTime()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const stepDay = (delta: -1 | 1): void => {
  const day = props.selectedMoveableDay
  if (!day) return
  const next = addDays(day, delta)
  if (props.allowedMoveableDates(next)) {
    emit('update:selectedMoveableDay', next)
  }
}

const contingencyPeriodModel = computed({
  get: () => props.contingencyPeriod,
  set: (value: Props['contingencyPeriod']) => {
    emit('update:contingencyPeriod', { ...value })
  }
})

const canConfirm = computed(() => {
  if (!props.moveableOptions) return false
  if (!hasClosingDate.value) return true
  if (props.moveableAppointmentSlots.length === 0) return true
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
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
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
