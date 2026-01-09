/**
 * Form Element DOM Patching Utilities
 *
 * WHY: Keep DOM access out of composables/components so audits can track side-effects cleanly.
 * PATTERN: Utilities own `document`, `MutationObserver`, and DOM traversal. Callers only orchestrate.
 */

import type { Ref } from 'vue'
import { nextTick } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { patchFormElements } from '@/utils/patchFormElements'

export type VFormInstance = InstanceType<typeof import('vuetify/components').VForm>

export type FormElementPatchingOptions = {
  formRef?: Ref<VFormInstance | null>
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

  const maybeEl = (formRef.value as unknown as { $el?: unknown }).$el
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

  // Fallback: try querying document after mount tick.
  await nextTick()
  const fallback = getFormElementBySelector(formSelector)
  if (fallback) {
    patchFormElements(fallback)
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
    // Patch the form as soon as it appears.
    const formElement = getFormElementBySelector(formSelector)
    if (formElement) {
      const descriptor = Object.getOwnPropertyDescriptor(formElement, 'elements')
      if (!descriptor || descriptor.configurable) {
        patchFormElements(formElement)
        observer.disconnect()
        return
      }
    }

    // Patch autocomplete on dynamically added controls.
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


