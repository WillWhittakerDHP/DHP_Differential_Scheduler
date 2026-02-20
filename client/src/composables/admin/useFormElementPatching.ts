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
   * LEARNING: Try to patch form element immediately
   * WHY: Browser extension might access form.elements before async operations run
   * PATTERN: Synchronous function that attempts to find and patch form element
   */
  tryPatchFormImmediately: () => boolean
  
  /**
   * LEARNING: Patch form element from formRef
   * WHY: VForm might not have rendered form element during setup, so patch in onMounted
   * PATTERN: Function that attempts to patch form element from VForm ref
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
   * LEARNING: Try to patch form element immediately (synchronously)
   * WHY: Browser extension might access form.elements before async operations run
   * PATTERN: Synchronous function that attempts to find and patch form element
   */
  const tryPatchFormImmediately = (): boolean => {
    return tryPatchFormImmediatelyBySelector(formSelector)
  }
  
  /**
   * LEARNING: Patch form element from formRef
   * WHY: VForm might not have rendered form element during setup, so patch in onMounted
   * PATTERN: Function that attempts to patch form element from VForm ref
   */
  const patchFormFromRef = (): void => {
    void patchFormFromVFormRef(formRef, formSelector)
  }
  
  /**
   * LEARNING: Patch form element when component mounts
   * WHY: VForm might not have rendered form element during setup, so patch in onMounted
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
   * LEARNING: Clean up MutationObserver on unmount
   * WHY: Prevent memory leaks by disconnecting observer
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

