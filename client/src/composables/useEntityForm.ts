/**
 * Entity Form Composable
 * 
 * LEARNING: Provides entity form operations extracted from EntityCard component
 * WHY: Encapsulates form validation, save, reset, and change detection logic
 * PATTERN: Composable that manages entity form state and operations
 * 
 * This composable addresses recursion issues by moving all logic out of components
 * and into properly memoized computed properties.
 */

import { computed, type Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { EntityCardSharedProps } from '@/components/admin/generic/entityCardConstants'

/** Extends EntityCardSharedProps for single source of truth (TYPE_SIMILARITY 1.10). */
export interface UseEntityFormOptions extends EntityCardSharedProps {
  form: FormContext
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
}

export interface UseEntityFormReturn {
  canSave: Ref<boolean>
  hasChanges: Ref<boolean>
  
  save: () => Promise<void>
  reset: () => void
  validate: () => Promise<boolean>
}

/**
 * Entity Form Composable
 * 
 * LEARNING: Manages entity form operations including validation, save, and reset
 * WHY: Prevents recursion by moving all logic to computed properties
 * PATTERN: Composable with computed properties for state and methods for operations
 */
export function useEntityForm(options: UseEntityFormOptions): UseEntityFormReturn {
  const {
    form,
    entity: entityOption
  } = options
  
  const entity = 'value' in entityOption ? entityOption : computed(() => entityOption)
  
  /**
   * LEARNING: Check if form can be saved
   * WHY: Form can be saved if it's valid and has changes
   * PATTERN: Computed property that checks form validity and changes
   */
  const canSave = computed(() => {
    return form.meta.value.valid && form.meta.value.dirty
  })
  
  /**
   * LEARNING: Check if form has changes
   * WHY: Determines if form values differ from original entity values
   * PATTERN: Computed property that compares form values with entity values
   */
  const hasChanges = computed(() => {
    return form.meta.value.dirty
  })
  
  /**
   * LEARNING: Validate form
   * WHY: Validates all form fields
   * PATTERN: Call form.validate() and return validation result
   */
  const validate = async (): Promise<boolean> => {
    const { valid } = await form.validate()
    return valid
  }
  
  /**
   * LEARNING: Save form
   * WHY: Validates and prepares form values for saving
   * PATTERN: Validate form, then return form values (actual save handled by component)
   */
  const save = async (): Promise<void> => {
    const isValid = await validate()
    if (!isValid) {
      throw new Error('Form validation failed')
    }
  }
  
  /**
   * LEARNING: Reset form
   * WHY: Resets form to original entity values
   * PATTERN: Call form.resetForm() with entity values
   */
  const reset = (): void => {
    const val = entity.value
    form.resetForm({
      values: typeof val === 'object' && val !== null ? { ...val } : {},
    })
  }
  
  return {
    canSave,
    hasChanges,
    save,
    reset,
    validate
  }
}

