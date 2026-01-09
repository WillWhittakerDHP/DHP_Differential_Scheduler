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

/**
 * Entity Form Composable Options
 */
export interface UseEntityFormOptions {
  entityKey: GlobalEntityKey
  entityId: string
  form: FormContext
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
}

/**
 * Entity Form Composable Return Type
 */
export interface UseEntityFormReturn {
  // Computed properties
  canSave: Ref<boolean>
  hasChanges: Ref<boolean>
  
  // Methods
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
    // entityKey and entityId available for future entity-specific form logic
    form,
    entity: entityOption
  } = options
  
  // Convert entity to Ref if needed
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
    // Form values are available via form.values
    // Actual save operation (API call) is handled by component
  }
  
  /**
   * LEARNING: Reset form
   * WHY: Resets form to original entity values
   * PATTERN: Call form.resetForm() with entity values
   */
  const reset = (): void => {
    form.resetForm({
      values: {
        ...entity.value,
      }
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

