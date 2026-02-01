/**
 * Local State Plugin
 * 
 * LEARNING: State plugin for local ref-based state management
 * WHY: Provides backward compatibility with existing modelValue prop pattern
 * PATTERN: Plugin that reads/writes to a local reactive ref
 */

import { computed, type Ref } from 'vue'
import type { StatePlugin, SelectionCardItem } from '../types/selectionCardTypes'

export function createLocalStatePlugin(
  modelValue: Ref<string | null>,
  updateModelValue: (value: string | null) => void
): StatePlugin {
  return {
    name: 'localState',
    
    getValue: (item: SelectionCardItem): boolean => {
      return modelValue.value === item.id
    },
    
    /**
     * Set value for an item
     * LEARNING: Updates modelValue to item.id (select) or null (deselect)
     * WHY: Updates selection state
     */
    setValue: (item: SelectionCardItem, value: boolean | string | null): void => {
      if (value === true || value === item.id) {
        updateModelValue(item.id)
      } else {
        updateModelValue(null)
      }
    },
    
    /**
     * Watch source for reactivity
     * LEARNING: Returns computed that tracks modelValue changes
     * WHY: Enables SelectionCard to react to external state changes
     */
    watchSource: () => computed(() => modelValue.value)
  }
}

