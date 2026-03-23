import type { Ref } from 'vue'
import type { VForm } from 'vuetify/components'

type VFormInstance = InstanceType<typeof VForm>

export interface FormElementPatchingOptionsBase {
  formRef?: Ref<VFormInstance | null>
  formSelector?: string
  useMutationObserver?: boolean
}

export interface FormElementPatchingOptions extends FormElementPatchingOptionsBase {
  formSelector: string
  useMutationObserver: boolean
  observerTimeoutMs?: number
}

export interface UseFormElementPatchingReturn {
  tryPatchFormImmediately: () => boolean
  patchFormFromRef: () => void
}
