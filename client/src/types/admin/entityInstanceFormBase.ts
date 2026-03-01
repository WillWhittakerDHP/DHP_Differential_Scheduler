import type { Ref } from 'vue'

/**
 * Shared return shape for block/part instance form composables.
 */
export interface UseEntityInstanceFormReturn<FormData> {
  isEdit: Ref<boolean>
  entityId: Ref<string | undefined>
  formData: Ref<FormData>
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  loadEntity: () => Promise<void>
  handleSubmit: () => Promise<void>
  goBack: () => void
}
