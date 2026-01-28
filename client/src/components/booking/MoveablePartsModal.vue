<!--
  MoveablePartsModal Component
  
  LEARNING: Modal for scheduling moveable parts (like report writing)
  WHY: Allows users to specify when moveable work should be completed, bounded by contingency deadlines
  PATTERN: VDialog with form for contingency questions and time slot selection
  Session 1.4.15: Moveable Parts Scheduling Modal
  
  TEMPORARY DISABLE: Currently disabled - modal does not open when moveable parts detected
  FUTURE: Will be integrated into wizard-wide confirmation modal system
  
  Future Confirmation Modal Architecture:
  - Each wizard step may require confirmation under certain circumstances
  - Confirmation modals will be triggered after step completion, before proceeding to next step
  - MoveablePartsModal will be re-enabled as part of AvailabilityStep confirmation flow
  - Confirmation system will be centralized in a composable (e.g., useWizardConfirmations)
-->
<template>
  <VDialog
    v-model="showModalModel"
    max-width="800"
    scrollable
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-h5">Schedule Moveable Work</span>
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
            <h3 class="text-h6 mb-4">Contingency Deadline</h3>
            <p class="mb-4 text-body-2">
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

          <!-- Section 2: Available Completion Times -->
          <div v-if="moveableOptions">
            <h3 class="text-h6 mb-4">Available Completion Times</h3>

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
              <p class="mb-4 text-body-2">
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
import { computed, watch } from 'vue'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'
import { useLocalTime } from '@/composables/useLocalTime'

interface Props {
  showModal: boolean
  moveableOptions: MoveableSchedulingOptions | null
  selectedSlotIndex: number | null
  contingencyPeriod: {
    hasContingency: boolean
    endDate: string | null
    endTime: string | null
  }
  isLoadingOptions: boolean
}

interface Emits {
  (e: 'update:showModal', value: boolean): void
  (e: 'selectSlot', index: number): void
  (e: 'update:contingencyPeriod', value: Props['contingencyPeriod']): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed for v-model
const showModalModel = computed({
  get: () => props.showModal,
  set: (value: boolean) => emit('update:showModal', value)
})

// Computed for contingencyPeriod v-model
// LEARNING: Use computed with getter/setter for v-model binding
// WHY: Allows two-way binding of nested object properties
// PATTERN: Computed property that reads from props and emits updates
const contingencyPeriodModel = computed({
  get: () => props.contingencyPeriod,
  set: (value: Props['contingencyPeriod']) => {
    emit('update:contingencyPeriod', { ...value })
  }
})

// LEARNING: Can confirm if all required fields are valid
// WHY: Validates contingency period and slot selection before allowing confirmation
// PATTERN: Computed property that checks all validation requirements
const canConfirm = computed(() => {
  // Cannot confirm if options are still loading or not available
  if (!props.moveableOptions) return false
  
  // LEARNING: Validate contingency period when hasContingency is true
  // WHY: If user specifies a contingency deadline, endDate must be provided
  // PATTERN: Check hasContingency flag and require endDate if true
  if (props.contingencyPeriod.hasContingency) {
    if (!props.contingencyPeriod.endDate) {
      return false
    }
  }
  
  // LEARNING: If no slots available, can confirm (user can proceed without selecting a slot)
  // WHY: Some scenarios don't require slot selection
  if (props.moveableOptions.availableSlots.length === 0) {
    return true
  }
  
  // LEARNING: If slots are available, a slot must be selected
  // WHY: User must choose when moveable work should be completed
  // PATTERN: Return true only if selectedSlotIndex is not null
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
  return formatDateTimeForDisplay(isoDate as any, {
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
