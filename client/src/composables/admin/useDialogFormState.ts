/**
 * WHY: Dialog Form State Composable

LEARNING: Extracts dialog form state manag...
 */
import { ref, watch, type Ref } from 'vue'
import type { UseDialogFormStateOptions, UseDialogFormStateReturn } from '@/types/admin/dialogFormState'

export type {
  UseDialogFormStateOptions,
  UseDialogFormStateReturn,
} from '@/types/admin/dialogFormState'

export function useDialogFormState<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseDialogFormStateOptions<T>
): UseDialogFormStateReturn<T> {
  const {
    dialogOpen,
    initialValues = {} as T
  } = options
  
  const formValues = ref<T>({ ...initialValues } as T) as Ref<T>
  
  const resetForm = (): void => {
    formValues.value = { ...initialValues } as T
  }
  
  /**
   * LEARNING: Watch dialog open state and reset form when dialog opens
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




