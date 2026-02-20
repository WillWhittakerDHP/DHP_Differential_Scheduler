/**
 * LEARNING: Unified Save State Management for EntityCard
 * WHY: Tracks both form field changes AND status button changes to determine if save button should be enabled
 * PATTERN: Composable that combines form dirty state with status button change tracking
 * 
 * This composable solves the problem where:
 * - Form dirty state only tracks form field changes
 * - Status button toggles bypass form state (use primitive mutations)
 * - Save button needs to reflect ALL changes (form + status buttons)
 */

import { ref, computed, type ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { EntityCardSharedProps } from '@/components/admin/generic/entityCardConstants'

/** Extends EntityCardSharedProps for single source of truth (TYPE_SIMILARITY 1.10). */
export interface UseEntityCardSaveStateOptions extends EntityCardSharedProps {
  form: FormContext
  /**
   * Function to get current entity values for reset
   * WHY: After save, we need to reset form to the saved entity values
   * PATTERN: Function that returns current entity values
   */
  getEntityValues: () => Record<string, unknown>
}

export interface UseEntityCardSaveStateReturn {
  canSave: ComputedRef<boolean>
  
  hasChanges: ComputedRef<boolean>
  
  markStatusButtonChanged: (fieldKey: string) => void
  
  resetSaveState: () => void
  
  isStatusButtonChanged: (fieldKey: string) => boolean
}

/**
 * LEARNING: Unified save state management composable
 * WHY: Combines form dirty state with status button change tracking
 * PATTERN: Track status button changes separately, combine with form dirty state
 */
export function useEntityCardSaveState(
  options: UseEntityCardSaveStateOptions
): UseEntityCardSaveStateReturn {
  const { form, getEntityValues } = options
  
  const statusButtonChanges = ref(new Set<string>())
  
  /**
   * LEARNING: Check if form can be saved
   * WHY: Form can be saved if it has form changes OR status button changes
   * PATTERN: Combine form dirty state with status button change tracking
   */
  const canSave = computed(() => {
    const hasFormChanges = form.meta.value.dirty
    const hasStatusButtonChanges = statusButtonChanges.value.size > 0
    return hasFormChanges || hasStatusButtonChanges
  })
  
  /**
   * LEARNING: Check if there are any changes
   * WHY: Same as canSave, but more semantic for "has changes" checks
   * PATTERN: Alias for canSave
   */
  const hasChanges = computed(() => canSave.value)
  
  /**
   * LEARNING: Mark a status button field as changed
   * WHY: When status button is toggled, we need to track that change separately from form state
   * PATTERN: Add field key to Set of changed status buttons
   */
  const markStatusButtonChanged = (fieldKey: string): void => {
    statusButtonChanges.value.add(fieldKey)
  }
  
  /**
   * LEARNING: Reset save state
   * WHY: After successful save, clear both form dirty state and status button changes
   * PATTERN: Reset form to saved entity values and clear status button changes Set
   */
  const resetSaveState = (): void => {
    // PATTERN: Reset form to current entity values from store
    const entityValues = getEntityValues()
    form.resetForm({
      values: entityValues
    })
    
    statusButtonChanges.value.clear()
  }
  
  /**
   * LEARNING: Check if a specific status button field has been changed
   * WHY: Allows checking if a specific field was changed (useful for debugging or conditional logic)
   * PATTERN: Check if field key exists in Set
   */
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
