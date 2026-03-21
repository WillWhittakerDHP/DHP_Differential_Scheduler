<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="800"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-headline-medium">Distribute Changes to Components</span>
        <VBtn
          icon
          variant="text"
          @click="updateModelValue(false)"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <p class="mb-4">
          You're editing computed properties on a composer. These changes will be distributed to all components.
        </p>

        <!-- Distribution Strategy Selection -->
        <VSelect
          v-model="selectedStrategy"
          :items="strategyItems"
          label="Distribution Strategy"
          class="mb-4"
        />

        <!-- Preview Table -->
        <VTable v-if="preview.length > 0">
          <thead>
            <tr>
              <th>Component</th>
              <th>Current Value</th>
              <th>New Value</th>
              <th>Change</th>
              <th v-if="selectedStrategy === 'manual'">Manual Value</th>
            </tr>
          </thead>
          <ComponentDistributionTableBody
            :preview="preview"
            :selected-strategy="selectedStrategy"
            :manual-values="manualValues"
            :get-component-name="getComponentName"
            :format-value="formatValue"
            :set-manual-value="setManualValue"
          />
        </VTable>

        <VAlert
          v-else
          type="info"
          class="mt-4"
        >
          No components found.
        </VAlert>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="updateModelValue(false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="isDistributing"
          @click="handleConfirm"
        >
          Distribute Changes
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy } from '@/types/component'
import { DISTRIBUTION_STRATEGIES } from '@/constants/component'
import ComponentDistributionTableBody from './ComponentDistributionTableBody.vue'
import { useComponentDistribution } from '@/composables/useComponentDistribution'
import { useComponentDistributionConfirm } from '@/composables/admin/useComponentDistributionConfirm'

interface Props {
  modelValue: boolean
  entityKey: GlobalEntityKey
  composerId: GlobalEntityId
  propertyKey: string
  newValue: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', distributionStrategy: DistributionStrategy, distributionValues?: Record<GlobalEntityId, Record<string, unknown>>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedStrategy = ref<DistributionStrategy>('proportional')
const manualValues = ref<Record<GlobalEntityId, number>>({})

const strategyItems = [
  { title: 'Proportional', value: DISTRIBUTION_STRATEGIES.PROPORTIONAL },
  { title: 'Equal', value: DISTRIBUTION_STRATEGIES.EQUAL },
  { title: 'Manual', value: DISTRIBUTION_STRATEGIES.MANUAL },
]

/**
 * WHY: Use component distribution composable for distribution logic
WHY: Moves ...
 */
const componentDistributionComposable = useComponentDistribution({
  entityKey: props.entityKey,
  composerId: computed(() => props.composerId),
  propertyKey: computed(() => props.propertyKey),
  newValue: computed(() => props.newValue),
  distributionStrategy: selectedStrategy,
  manualValues,
  modalOpen: computed(() => props.modelValue)
})

// WHY: Component uses composable's computed values and methods
// PATTERN: Destructure composable return values
const {
  preview,
  getComponentName,
  formatValue,
  updateManualPreview
} = componentDistributionComposable

function setManualValue(componentId: GlobalEntityId, value: number) {
  manualValues.value[componentId] = value
  updateManualPreview()
}

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

const { handleConfirm, isDistributing } = useComponentDistributionConfirm({
  preview,
  selectedStrategy,
  getPropertyKey: () => props.propertyKey,
  onConfirm: (strategy, distributionValues) => emit('confirm', strategy, distributionValues),
  onClose: () => updateModelValue(false),
})

// WHY: Strategy change and modal open watchers moved to composable
// PATTERN: Composable handles all state management
</script>
