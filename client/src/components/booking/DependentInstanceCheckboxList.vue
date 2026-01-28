<script setup lang="ts">
/**
 * DependentInstanceCheckboxList Component
 * 
 * LEARNING: Renders dependent instance options as a multi-select checkbox list
 * WHY: Provides multi-select capabilities for dependent options within parent card
 * PATTERN: Simple checkbox list component that integrates into SelectionCard
 * 
 * Features:
 * - Renders VCheckbox items for each dependent option
 * - Handles multi-select with array of selected IDs
 * - Displays option name and description
 * - Integrates seamlessly within SelectionCard border
 */

import type { SelectionCardItem } from './types/selectionCardTypes'

/**
 * Component props
 */
interface Props {
  /**
   * Array of dependent option items to display
   */
  options: SelectionCardItem[]
  
  /**
   * Currently selected option IDs (array for multi-select)
   */
  modelValue: string[]
  
  /**
   * Whether the checkbox list is disabled
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false
})

/**
 * Component emits
 */
interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const emit = defineEmits<Emits>()

/**
 * Check if an option is selected
 */
function isOptionSelected(optionId: string): boolean {
  return props.modelValue.includes(optionId)
}

/**
 * Handle checkbox toggle
 */
function handleToggle(optionId: string, selected: boolean): void {
  const current = [...props.modelValue]
  
  if (selected) {
    // Add to array if not already present
    if (!current.includes(optionId)) {
      current.push(optionId)
    }
  } else {
    // Remove from array
    const index = current.indexOf(optionId)
    if (index > -1) {
      current.splice(index, 1)
    }
  }
  
  emit('update:modelValue', current)
}
</script>

<template>
  <VExpandTransition>
    <div
      v-if="options.length > 0"
      class="dependent-instance-checkbox-list"
      @click.stop
    >
      <div
        v-for="option in options"
        :key="option.id"
        class="dependent-option-item"
      >
        <VCheckbox
          :model-value="isOptionSelected(option.id)"
          :disabled="disabled"
          :label="option.name"
          @update:model-value="handleToggle(option.id, $event ?? false)"
        >
          <template #label>
            <div class="dependent-option-content">
              <span class="text-body-1 font-weight-medium">
                {{ option.name }}
              </span>
            </div>
          </template>
        </VCheckbox>
      </div>
    </div>
  </VExpandTransition>
</template>

<style scoped lang="scss">
/**
 * LEARNING: Dependent instance checkbox list styling
 * WHY: Provides proper spacing and layout within parent card
 * PATTERN: Indented block with consistent spacing
 */
.dependent-instance-checkbox-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  .dependent-option-item {
    :deep(.v-checkbox) {
      width: 100%;
      
      .v-label {
        width: 100%;
      }
    }
  }
  
  .dependent-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }
}
</style>

