/**
 * Dialog Form State Composable
 * 
 * LEARNING: Extracts dialog form state management from dialog components
 * WHY: Moves form reset logic out of components into reusable composable
 * PATTERN: Composable that manages form state and resets on dialog open
 * 
 * This composable handles:
 * - Form field state management
 * - Resetting form when dialog opens
 */

import { ref, watch, type Ref } from 'vue'

/**
 * Dialog Form State Composable Options
 */
export interface UseDialogFormStateOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Dialog open state
   */
  dialogOpen: Ref<boolean>
  
  /**
   * Initial form values (used for reset)
   */
  initialValues?: T
}

/**
 * Dialog Form State Composable Return Type
 */
export interface UseDialogFormStateReturn<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Form values ref
   */
  formValues: Ref<T>
  
  /**
   * Reset form to initial values
   */
  resetForm: () => void
}

/**
 * Dialog Form State Composable
 * 
 * LEARNING: Manages dialog form state and resets on open
 * WHY: Extracts form state management from dialog components to composable
 * PATTERN: Composable with form values ref and reset logic
 */
export function useDialogFormState<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseDialogFormStateOptions<T>
): UseDialogFormStateReturn<T> {
  const {
    dialogOpen,
    initialValues = {} as T
  } = options
  
  /**
   * LEARNING: Form values state
   * WHY: Tracks form field values
   * PATTERN: Ref initialized with initial values
   */
  const formValues = ref<T>({ ...initialValues } as T) as Ref<T>
  
  /**
   * LEARNING: Reset form to initial values
   * WHY: Clears form when dialog closes or manually reset
   * PATTERN: Function that resets formValues to initial values
   */
  const resetForm = (): void => {
    formValues.value = { ...initialValues } as T
  }
  
  /**
   * LEARNING: Watch dialog open state and reset form when dialog opens
   * WHY: Ensures form is clean when dialog opens
   * PATTERN: Watch dialogOpen ref, reset form when it becomes true
   */
  watch(dialogOpen, (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  })
  
  return {
    formValues,
    resetForm
  }
}




