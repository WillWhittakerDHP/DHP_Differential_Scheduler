<script setup lang="ts">
/**
 * AvailabilityOptionsSection – availability options cascade error, empty state, and SelectionCardGroup.
 * Used by AvailabilityStep; receives wizard-derived data as props.
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'

interface Props {
  hasSelectedServices: boolean
  cascadeError: string | null
  availableOptionTypeBlocks: BookingBlockInstance[]
  selectedOptionTypeBlockId: string | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:selectedOptionTypeBlockId': [value: string | null]
}>()
</script>

<template>
  <div v-if="hasSelectedServices" class="availability-options-section">
    <h5 class="text-h5 mb-4 mb-sm-6">Availability Options</h5>

    <VAlert
      v-if="cascadeError"
      type="error"
      variant="tonal"
      class="mb-6"
    >
      {{ cascadeError }}
    </VAlert>

    <div
      v-else-if="availableOptionTypeBlocks.length === 0"
      class="text-body-1 text-medium-emphasis py-4"
    >
      No availability options available for selected service.
    </div>

    <SelectionCardGroup
      v-else
      :model-value="selectedOptionTypeBlockId"
      :items="availableOptionTypeBlocks"
      :config="{
        selectionType: 'radio',
        selectionComponent: 'VRadio',
        selectionGroup: 'none',
        stateSource: 'local',
        layout: 'stack',
        controlPosition: 'left',
        appearance: {
          showIcon: false,
          showBorder: true,
          cardPadding: 'pa-3',
          minHeight: 'auto'
        },
        expansion: { enabled: false }
      }"
      class="availability-cards"
      @update:model-value="emit('update:selectedOptionTypeBlockId', Array.isArray($event) ? ($event[0] ?? null) : $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.availability-options-section {
  margin-top: 0;
  padding-top: 1.5rem;
  width: 100%;

  @media (min-width: 600px) {
    padding-top: 1.5rem;
  }
}

.availability-cards {
  margin-bottom: 1rem;
}
</style>
