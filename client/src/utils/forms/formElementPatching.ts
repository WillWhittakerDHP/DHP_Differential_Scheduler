import type { Ref } from 'vue'
import { nextTick } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { patchFormElements } from '@/utils/patchFormElements'
import { VForm } from 'vuetify/components'

type VFormInstance = InstanceType<typeof VForm>

/** Base shared with UseFormElementPatchingOptions (P2 type-similarity). */
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

function getFormElementBySelector(formSelector: string): HTMLFormElement | null {
  const el = document.querySelector(formSelector)
  if (!el) return null
  return el.tagName === 'FORM' ? (el as HTMLFormElement) : null
}

export function tryPatchFormImmediatelyBySelector(formSelector: string): boolean {
  if (!formSelector) return false
  const formElement = getFormElementBySelector(formSelector)
  if (!formElement) return false
  patchFormElements(formElement)
  return true
}

export async function patchFormFromVFormRef(
  formRef: Ref<VFormInstance | null> | undefined,
  formSelector: string
): Promise<void> {
  if (!formRef?.value) return

  let formElement: HTMLFormElement | null = null

  const maybeEl = '$el' in formRef.value ? formRef.value.$el : undefined
  if (maybeEl && typeof maybeEl === 'object') {
    const el = maybeEl as HTMLElement
    if (el.tagName === 'FORM') {
      formElement = el as HTMLFormElement
    } else {
      formElement = el.querySelector?.('form') ?? null
    }
  }

  if (formElement && formElement.tagName === 'FORM') {
    patchFormElements(formElement)
    return
  }

  await nextTick()
  const elementBySelector = getFormElementBySelector(formSelector)
  if (elementBySelector) {
    patchFormElements(elementBySelector)
    return
  }

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

export function setupFormMutationObserver(options: FormElementPatchingOptions): () => void {
  const { formSelector, useMutationObserver, observerTimeoutMs = 10_000 } = options

  if (!useMutationObserver) return () => {}
  if (!formSelector) return () => {}
  if (typeof MutationObserver === 'undefined') return () => {}

  const observer = new MutationObserver((mutations) => {
    const formElement = getFormElementBySelector(formSelector)
    if (formElement) {
      const descriptor = Object.getOwnPropertyDescriptor(formElement, 'elements')
      if (!descriptor || descriptor.configurable) {
        patchFormElements(formElement)
        observer.disconnect()
        return
      }
    }

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        patchAutocompleteOnElement(node as HTMLElement)
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false, // Avoid infinite loops
  })

  const timeoutId = window.setTimeout(() => {
    observer.disconnect()
  }, observerTimeoutMs)

  return () => {
    window.clearTimeout(timeoutId)
    observer.disconnect()
  }
}


