<script setup lang="ts">
/**
 * UserTypeBlockSelectCards Component
 * 
 * LEARNING: Thin wrapper for user type selection cards
 * WHY: Provides clean interface while keeping SelectionCardGroup generic
 * PATTERN: Wrapper component that connects wizard state to generic UI
 * 
 * Features:
 * - Connects to useBookingWizard for user types
 * - Uses row layout for horizontal grid display
 * - Single-select behavior (radio-like)
 * - Maps display properties (icons, descriptions)
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 */

import { computed } from 'vue'
import SelectionCardGroup from '../SelectionCardGroup.vue'
import type { SelectionCardConfig } from '../types/selectionCardTypes'
import { useBookingWizard } from '@/composables/useBookingWizard'
import { useInstanceDisplay } from '@/composables/booking/useInstanceDisplay'
import { useInstanceSelectionConfig } from '@/composables/booking/useInstanceSelectionConfig'
import { calculateGridColumnsForItemCount } from '@/utils/booking/selectionCardGroupConfig'

interface Props {
  config?: Partial<SelectionCardConfig>
}

const props = withDefaults(defineProps<Props>(), {})

interface Emits {
  (e: 'select', id: string | null): void
}

const emit = defineEmits<Emits>()

const wizard = useBookingWizard()

const { instancesWithDisplay } = useInstanceDisplay({
  instances: computed(() => wizard.availableUserTypeBlocks.value)
})

const { selectionConfig } = useInstanceSelectionConfig({
  selectionType: 'row',
  stateField: 'userTypeBlock',
  selectedValue: computed(() => wizard.selectedUserTypeBlock.value)
})

const mergedConfig = computed<SelectionCardConfig>(() => {
  const baseConfig = selectionConfig.value
  const itemCount = instancesWithDisplay.value.length
  
  const dynamicGridColumns = calculateGridColumnsForItemCount(itemCount)
  
  if (props.config) {
    return {
      ...baseConfig,
      ...props.config,
      gridColumns: props.config.gridColumns || dynamicGridColumns,
      appearance: {
        ...baseConfig.appearance,
        ...props.config.appearance
      }
    }
  }
  
  return {
    ...baseConfig,
    gridColumns: dynamicGridColumns
  }
})

const selectedId = computed<string | null>({
  get: () => wizard.selectedUserTypeBlock.value?.id || null,
  set: (id: string | null) => {
    if (id) {
      const userTypeBlock = wizard.availableUserTypeBlocks.value.find(ut => ut.id === id)
      if (userTypeBlock) {
        wizard.selectUserTypeBlock(userTypeBlock)
        emit('select', id)
      }
    } else {
      wizard.selectUserTypeBlock(null)
      emit('select', null)
    }
  }
})
</script>

<template>
  <!-- LEARNING: Thin wrapper for user type selection -->
  <!-- WHY: Clean interface connecting wizard to generic UI component -->
  <SelectionCardGroup
    v-model="selectedId"
    :items="instancesWithDisplay"
    :config="mergedConfig"
    class="user-type-select-cards"
  />
</template>

<style scoped>
/* LEARNING: Minimal styling - let SelectionCardGroup handle layout */
.user-type-select-cards {
  /* Wrapper-specific styling if needed */
}
</style>

