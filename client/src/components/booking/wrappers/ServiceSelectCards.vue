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
 * - Maps display properties (icons, user-type-specific descriptions)
 * - Supports dependent instance options (nested children)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed } from 'vue'
import SelectionCardGroup from '../SelectionCardGroup.vue'
import type { SelectionCardConfig } from '../types/selectionCardTypes'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceDescriptions } from '@/composables/booking/useInstanceDescriptions'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'

/**
 * Component props
 */
interface Props {
  /**
   * Optional custom configuration
   */
  config?: Partial<SelectionCardConfig>
  
  /**
   * Whether to show dependent instance options
   * LEARNING: When true, services with dependentInstanceOptions show nested children
   */
  showDependentOptions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDependentOptions: true
})

/**
 * Component emits
 */
interface Emits {
  (e: 'toggle', id: string): void
  (e: 'toggleDependentOption', parentId: string, childId: string): void
}

const emit = defineEmits<Emits>()

// LEARNING: Get wizard instance for state management
const wizard = useBookingWizard()

// LEARNING: Use instance descriptions for user-type-specific filtering
const { getFilteredDescription } = useInstanceDescriptions({
  instances: computed(() => wizard.availableServices.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value)
})

// LEARNING: Use instance display for icon/description mapping
const { instancesWithDisplay } = useInstanceDisplay({
  instances: computed(() => wizard.availableServices.value),
  selectedUserTypeBlock: computed(() => wizard.selectedUserTypeBlock.value),
  getFilteredDescription
})

// LEARNING: Use instance selection config for layout
const { selectionConfig } = useInstanceSelectionConfig({
  selectionType: 'stack',
  stateField: 'services',
  selectedValue: computed(() => wizard.selectedServices.value)
})

// LEARNING: Merge custom config with defaults
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

// LEARNING: V-model bridge for single-select (radio UI, array storage)
// WHY: UI behaves as single-select but stored as array for consistency
// PATTERN: Replace array with single selection when new service is selected
const selectedIds = computed<string[]>({
  get: () => wizard.selectedServices.value.map(s => s.id),
  set: (ids: string[]) => {
    // Single-select behavior: replace array with new selection
    // If empty array, clear selection
    if (ids.length === 0) {
      if (wizard.selectedServices.value.length > 0) {
        // Clear selection by toggling the currently selected service
        wizard.toggleService(wizard.selectedServices.value[0], true)
      }
      return
    }
    
    // Get the new service ID (should be single item for radio)
    const newId = ids[ids.length - 1] // Take last item if multiple (shouldn't happen with radio)
    const currentId = wizard.selectedServices.value[0]?.id
    
    // Only update if selection changed
    if (newId !== currentId) {
      const service = wizard.availableServices.value.find(s => s.id === newId)
      if (service) {
        wizard.toggleService(service, true) // Skip cascade during batch
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

