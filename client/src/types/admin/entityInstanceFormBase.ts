import type { Ref } from 'vue'

/**
 * Shared return shape for block/part instance form composables.
 * WHY: UseBlockInstanceFormReturn and UsePartInstanceFormReturn share 8 of 9 fields; single generic base eliminates duplication.
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
