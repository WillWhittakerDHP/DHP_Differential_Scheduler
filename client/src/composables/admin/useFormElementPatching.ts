import { onMounted, onBeforeUnmount } from 'vue'
import { nextTick } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { patchFormElements } from '@/utils/patchFormElements'
import type {
  FormElementPatchingOptionsBase,
  FormElementPatchingOptions,
  UseFormElementPatchingOptions,
  UseFormElementPatchingReturn
} from '@/types/admin/formElementPatching'

function getFormElementBySelector(formSelector: string): HTMLFormElement | null {
  if (typeof document === 'undefined') return null
  const el = document.querySelector(formSelector)
  if (!el) return null
  return el.tagName === 'FORM' ? (el as HTMLFormElement) : null
}

function resolveFormElement(formRef: FormElementPatchingOptionsBase['formRef']): HTMLFormElement | null {
  if (!formRef?.value) return null
  const maybeEl = '$el' in formRef.value ? formRef.value.$el : undefined
  if (!maybeEl || typeof maybeEl !== 'object') return null
  const el = maybeEl as HTMLElement
  if (el.tagName === 'FORM') return el as HTMLFormElement
  return el.querySelector?.('form') ?? null
}

export function tryPatchFormImmediatelyBySelector(formSelector: string): boolean {
  if (!formSelector) return false
  const formElement = getFormElementBySelector(formSelector)
  if (!formElement) return false
  patchFormElements(formElement)
  return true
}

export async function patchFormFromVFormRef(
  formRef: FormElementPatchingOptionsBase['formRef'],
  formSelector: string
): Promise<void> {
  const formElement = resolveFormElement(formRef)
  if (formElement) {
    patchFormElements(formElement)
    return
  }
  await nextTick()
  const elementBySelector = getFormElementBySelector(formSelector)
  if (elementBySelector) patchFormElements(elementBySelector)
}

function patchAutocompleteOnElement(element: HTMLElement): void {
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    element.setAttribute('autocomplete', AUTCOMPLETE_OFF)
  }
  const formControls = element.querySelectorAll?.('input, select, textarea')
  formControls?.forEach((el: Element) => {
    el.setAttribute('autocomplete', AUTCOMPLETE_OFF)
  })
}

function patchAddedFormElements(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue
      patchAutocompleteOnElement(node as HTMLElement)
    }
  }
}

function handleFormMutations(
  mutations: MutationRecord[],
  formSelector: string,
  observer: MutationObserver
): void {
  const formElement = getFormElementBySelector(formSelector)
  if (formElement) {
    const descriptor = Object.getOwnPropertyDescriptor(formElement, 'elements')
    if (!descriptor || descriptor.configurable) {
      patchFormElements(formElement)
      observer.disconnect()
      return
    }
  }
  patchAddedFormElements(mutations)
}

export function setupFormMutationObserver(options: FormElementPatchingOptions): () => void {
  const { formSelector, useMutationObserver, observerTimeoutMs = 10_000 } = options

  if (!useMutationObserver) return () => {}
  if (!formSelector) return () => {}
  if (typeof MutationObserver === 'undefined') return () => {}
  if (typeof document === 'undefined' || typeof window === 'undefined') return () => {}

  const observer = new MutationObserver((mutations) => {
    handleFormMutations(mutations, formSelector, observer)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })

  const timeoutId = window.setTimeout(() => {
    observer.disconnect()
  }, observerTimeoutMs)

  return () => {
    window.clearTimeout(timeoutId)
    observer.disconnect()
  }
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

  const tryPatchFormImmediately = (): boolean => tryPatchFormImmediatelyBySelector(formSelector)
  const patchFormFromRef = (): void => { void patchFormFromVFormRef(formRef, formSelector) }

  onMounted(() => {
    patchFormFromRef()
    cleanupObserver = setupFormMutationObserver({
      formRef,
      formSelector,
      useMutationObserver,
    })
  })

  onBeforeUnmount(() => {
    cleanupObserver?.()
    cleanupObserver = null
  })

  return {
    tryPatchFormImmediately,
    patchFormFromRef
  }
}
