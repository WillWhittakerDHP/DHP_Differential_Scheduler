/**

LEARNING: State plugin for local ref-based state man...
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
     */
    setValue: (item: SelectionCardItem, value: boolean | string | null): void => {
      if (value === true || value === item.id) {
        updateModelValue(item.id)
      } else {
        updateModelValue(null)
      }
    },
    
    /**
Watch source for reactivity
WHY: Enables SelectionCard to react to e...
     */
    watchSource: () => computed(() => modelValue.value)
  }
}

