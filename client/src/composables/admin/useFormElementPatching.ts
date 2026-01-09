/**
 * Form Element Patching Composable
 * 
 * LEARNING: Extracts DOM patching logic from components
 * WHY: Components should be thin UI wrappers - DOM manipulation logic belongs in composables
 * PATTERN: Composable that handles form element patching and MutationObserver setup
 * 
 * This composable handles:
 * - Finding form elements in DOM
 * - Patching form elements with autocomplete attributes
 * - Setting up MutationObserver to catch dynamically added form elements
 * - Cleaning up observers on unmount
 */

import { onMounted, onBeforeUnmount, type Ref } from 'vue'
import {
  patchFormFromVFormRef,
  setupFormMutationObserver,
  tryPatchFormImmediatelyBySelector,
  type VFormInstance,
} from '@/utils/forms/formElementPatching'

/**
 * Form Element Patching Composable Options
 */
export interface UseFormElementPatchingOptions {
  /**
   * LEARNING: Form element reference
   * WHY: VForm component ref for accessing underlying form element
   * PATTERN: Template ref to VForm component
   */
  formRef?: Ref<VFormInstance | null>
  
  /**
   * LEARNING: CSS class selector for form element
   * WHY: Used to find form element in DOM when formRef is not available
   * PATTERN: CSS class selector string (e.g., '.dynamic-form-fields')
   */
  formSelector?: string
  
  /**
   * LEARNING: Whether to set up MutationObserver
   * WHY: MutationObserver watches for dynamically added form elements
   * PATTERN: Boolean flag, defaults to true
   */
  useMutationObserver?: boolean
}

/**
 * Form Element Patching Composable Return Type
 */
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

/**
 * Form Element Patching Composable
 * 
 * LEARNING: Handles form element patching and DOM observation
 * WHY: Moves DOM manipulation logic out of components into reusable composable
 * PATTERN: Composable with lifecycle hooks for form patching
 */
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
    // Try to patch from formRef if available
    patchFormFromRef()
    
    // Set up MutationObserver fallback
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

