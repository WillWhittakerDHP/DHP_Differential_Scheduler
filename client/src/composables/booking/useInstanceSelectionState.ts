/**
 * PATTERN: useInstanceSelectionState Composable

PATTERN: Composable that provides ...
 */
import { computed, watch, nextTick } from 'vue'
import { findById } from '@/utils/collections/findById'
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type { UseInstanceSelectionStateParams, UseInstanceSelectionStateReturn } from '@/types/booking/instanceSelectionState'

export type {
  GenericWizardInstance,
  UseInstanceSelectionStateParams,
  UseInstanceSelectionStateReturn,
} from '@/types/booking/instanceSelectionState'

/**
 * PATTERN: useInstanceSelectionState composable

PATTERN: Composable that provides ...
 */
export function useInstanceSelectionState(
  params: UseInstanceSelectionStateParams
): UseInstanceSelectionStateReturn {
  const { 
    availableInstances, 
    selectedInstances,
    toggleSelection,
    loadedWizardState 
  } = params

  /**
   * WHY: Enables v-model binding with VRadio while syncing with wizard state
   */
  const selectedId = computed<string | null>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value) 
        ? selectedInstances.value 
        : [selectedInstances.value].filter(Boolean)
      return instances[0]?.id || null
    },
    set: (id: string | null) => {
      if (id && toggleSelection) {
        const instance = findById(availableInstances.value, id)
        if (instance) {
          toggleSelection(instance)
        }
      }
    }
  })

  /**
   * WHY: Enables v-model binding with VCheckbox while syncing with wizard state
   */
  const selectedIds = computed<string[]>({
    get: () => {
      const instances = Array.isArray(selectedInstances.value) 
        ? selectedInstances.value 
        : [selectedInstances.value].filter(Boolean)
      return instances.map(i => i.id)
    },
    set: (ids: string[]) => {
      if (toggleSelection) {
        const { resolved: instances } = resolveByIds(availableInstances.value, ids)
        
        for (const instance of instances) {
          toggleSelection(instance, true) // Skip cascade during batch update
        }
      }
    }
  })

  /**
   * LEARNING: Watch loaded wizard state for initial population
   */
  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => {
      if (newState) {
        nextTick(() => {
        })
      }
    }, { immediate: true })
  }

  return {
    selectedId,
    selectedIds
  }
}

