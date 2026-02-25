/**
 * WHY: Unified Save State Management for EntityCard
PATTERN: Composable that co...
 */
import { ref, computed } from 'vue'
import type { UseEntityCardSaveStateOptions, UseEntityCardSaveStateReturn } from '@/types/admin/entityCardSaveState'

export type { UseEntityCardSaveStateOptions, UseEntityCardSaveStateReturn } from '@/types/admin/entityCardSaveState'

/**
 * WHY: Unified save state management composable
WHY: Combines form dirty state ...
 */
export function useEntityCardSaveState(
  options: UseEntityCardSaveStateOptions
): UseEntityCardSaveStateReturn {
  const { form, getEntityValues } = options
  
  const statusButtonChanges = ref(new Set<string>())
  
  /**
   * PATTERN: Combine form dirty state with status button change tracking
   */
  const canSave = computed(() => {
    const hasFormChanges = form.meta.value.dirty
    const hasStatusButtonChanges = statusButtonChanges.value.size > 0
    return hasFormChanges || hasStatusButtonChanges
  })
  
  /**
   * WHY: Same as canSave, but more semantic for "has changes" checks
   */
  const hasChanges = computed(() => canSave.value)
  
  /**
   * LEARNING: Mark a status button field as changed
   */
  const markStatusButtonChanged = (fieldKey: string): void => {
    statusButtonChanges.value.add(fieldKey)
  }
  
  /**
   * WHY: After successful save, clear both form dirty state and status button changes
   */
  const resetSaveState = (): void => {
    // PATTERN: Reset form to current entity values from store
    const entityValues = getEntityValues()
    form.resetForm({
      values: entityValues
    })
    
    statusButtonChanges.value.clear()
  }
  
  const isStatusButtonChanged = (fieldKey: string): boolean => {
    return statusButtonChanges.value.has(fieldKey)
  }
  
  return {
    canSave,
    hasChanges,
    markStatusButtonChanged,
    resetSaveState,
    isStatusButtonChanged
  }
}
