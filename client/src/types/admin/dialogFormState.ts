import type { Ref } from 'vue'

export interface UseDialogFormStateOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  dialogOpen: Ref<boolean>
  initialValues?: T
}

export interface UseDialogFormStateReturn<T extends Record<string, unknown> = Record<string, unknown>> {
  formValues: Ref<T>
  resetForm: () => void
}
