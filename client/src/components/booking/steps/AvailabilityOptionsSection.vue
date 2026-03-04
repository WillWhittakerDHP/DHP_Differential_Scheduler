<script setup lang="ts">
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import SelectionCardGroup from '@/components/booking/SelectionCardGroup.vue'

interface Props {
  hasSelectedServices: boolean
  cascadeError: string | null
  availableOptionTypeBlocks: BookingBlockInstance[]
  selectedOptionTypeBlockId: string | null
}

defineProps<Props>()

const availabilityOptionsConfig: SelectionCardConfig = {
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
    minHeight: 'auto',
  },
  expansion: { enabled: false },
}

const emit = defineEmits<{
  'update:selectedOptionTypeBlockId': [value: string | null]
}>()

function handleSelectedOptionTypeUpdate(value: string | string[] | null): void {
  emit('update:selectedOptionTypeBlockId', Array.isArray(value) ? (value[0] ?? null) : value)
}
</script>

<template>
  <div v-if="hasSelectedServices" class="availability-options-section">
    <h5 class="text-headline-medium mb-4 mb-sm-6">Availability Options</h5>

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
      class="text-body-large text-medium-emphasis py-4"
    >
      No availability options available for selected service.
    </div>

    <SelectionCardGroup
      v-else
      :model-value="selectedOptionTypeBlockId"
      :items="availableOptionTypeBlocks"
      :config="availabilityOptionsConfig"
      class="availability-cards"
      @update:model-value="handleSelectedOptionTypeUpdate"
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

  :deep(.selection-card-content h6),
  :deep(.text-headline-small) {
    font-size: 0.9375rem; /* 15px – reasonably less than headline-medium */
    font-weight: 500;
  }

  :deep(.selection-card-wrapper) {
    min-height: 0;
  }
  :deep(.selection-card),
  :deep(.selection-card-bordered) {
    min-height: 0 !important;
    padding: 0.5rem 0.75rem !important; /* Tighter than pa-3 to match smaller text */
    align-items: center;
    justify-content: flex-start;
  }
  :deep(.content-container) {
    padding: 0;
  }
}
</style>
