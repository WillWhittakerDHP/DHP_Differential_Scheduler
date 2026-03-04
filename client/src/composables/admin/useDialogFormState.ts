/**
 * WHY: Dialog Form State Composable

 */
import { ref, watch } from 'vue'
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
  
  const formValues = ref<T>({ ...initialValues } as T)
  
  const resetForm = (): void => {
    formValues.value = { ...initialValues } as T
  }
  
  /**
   */
  watch(dialogOpen, (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  })
  
  return {
    formValues,
    resetForm
  } as UseDialogFormStateReturn<T>
}
