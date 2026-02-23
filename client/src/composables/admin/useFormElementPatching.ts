import { onMounted, onBeforeUnmount } from 'vue'
import {
  patchFormFromVFormRef,
  setupFormMutationObserver,
  tryPatchFormImmediatelyBySelector,
  type FormElementPatchingOptionsBase
} from '@/utils/forms/formElementPatching'

/** Same shape as shared base (P2 type-similarity). */
export type UseFormElementPatchingOptions = FormElementPatchingOptionsBase

export interface UseFormElementPatchingReturn {
  /**
   */
  tryPatchFormImmediately: () => boolean
  
  /**
   */
  patchFormFromRef: () => void
}

export function useFormElementPatching(
  options: UseFormElementPatchingOptions = {}
): UseFormElementPatchingReturn {
  const {
    formRef,
    formSelector = '.dynamic-form-fields',
    useMutationObserver = true
  } = options
  let cleanupObserver: (() => void) | null = null
  
  /**
   */
  const tryPatchFormImmediately = (): boolean => {
    return tryPatchFormImmediatelyBySelector(formSelector)
  }
  
  /**
   */
  const patchFormFromRef = (): void => {
    void patchFormFromVFormRef(formRef, formSelector)
  }
  
  /**
   * PATTERN: Use onMounted hook to patch form element
   */
  onMounted(() => {
    patchFormFromRef()
    
    cleanupObserver = setupFormMutationObserver({
      formRef,
      formSelector,
      useMutationObserver,
    })
  })
  
  /**
   * PATTERN: Use onBeforeUnmount hook to disconnect observer
   */
  onBeforeUnmount(() => {
    cleanupObserver?.()
    cleanupObserver = null
  })
  
  return {
    tryPatchFormImmediately,
    patchFormFromRef
  }
}

