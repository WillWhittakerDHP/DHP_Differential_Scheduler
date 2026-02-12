<script setup lang="ts">
/**
 * ServiceSelectCards Component
 * 
 * LEARNING: Thin wrapper for service selection cards with dependent options
 * WHY: Provides clean interface while keeping SelectionCardGroup generic
 * PATTERN: Wrapper component that connects wizard state to generic UI
 * 
 * Features:
 * - Connects to useBookingWizard for services
 * - Uses stack layout for vertical list display
 * - Single-select behavior (radio-like) - selecting one deselects others
 * - Maps display properties (icons)
 * - Supports dependent instances (nested children)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed } from 'vue'
import SelectionCardGroup from '../SelectionCardGroup.vue'
import type { SelectionCardConfig } from '../types/selectionCardTypes'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'

interface Props {
  config?: Partial<SelectionCardConfig>
  
  showDependentInstances?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDependentInstances: true
})

interface Emits {
  (e: 'toggle', id: string): void
  (e: 'toggleDependentOption', parentId: string, childId: string): void
}

const emit = defineEmits<Emits>()

const wizard = useBookingWizard()

const { instancesWithDisplay } = useInstanceDisplay({
  instances: computed(() => wizard.availableServices.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})

const { selectionConfig } = useInstanceSelectionConfig({
  selectionType: 'stack',
  stateField: 'services',
  selectedValue: computed(() => wizard.selectedServiceTypeBlocks.value)
})

const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = selectionConfig.value
  
  if (props.config) {
    return {
      ...baseConfig,
      ...props.config,
      appearance: {
        ...baseConfig.appearance,
        ...props.config.appearance
      }
    }
  }
  
  return baseConfig
})

// WHY: UI behaves as single-select but stored as array for consistency
const selectedIds = computed<string[]>({
  get: () => wizard.selectedServiceTypeBlocks.value.map(s => s.id),
  set: (ids: string[]) => {
    if (ids.length === 0) {
      if (wizard.selectedServiceTypeBlocks.value.length > 0) {
        wizard.batchUpdate(() => {
          wizard.toggleServiceTypeBlock(wizard.selectedServiceTypeBlocks.value[0])
        })
      }
      return
    }

    const newId = ids[ids.length - 1] // Take last item if multiple (shouldn't happen with radio)
    const currentId = wizard.selectedServiceTypeBlocks.value[0]?.id

    if (newId !== currentId) {
      const service = wizard.availableServices.value.find(s => s.id === newId)
      if (service) {
        wizard.batchUpdate(() => wizard.toggleServiceTypeBlock(service))
        emit('toggle', newId)
      }
    }
  }
})
</script>

<template>
  <!-- LEARNING: Thin wrapper for service selection -->
  <!-- WHY: Clean interface connecting wizard to generic UI component -->
  <SelectionCardGroup
    v-model="selectedIds"
    :items="instancesWithDisplay"
    :config="mergedConfig"
    class="service-select-cards"
  />
</template>

<style scoped>
/* LEARNING: Minimal styling - let SelectionCardGroup handle layout */
.service-select-cards {
  /* Wrapper-specific styling if needed */
}
</style>

