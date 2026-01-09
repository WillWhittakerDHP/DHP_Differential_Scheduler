/**
 * Select DOM Association Utilities
 *
 * WHY: Vuetify/AppSelect may render native <select> asynchronously and not forward `name` attributes.
 * PATTERN: Keep DOM access here (utilities), not in composables/components.
 */

import { patchFormElements } from '@/utils/patchFormElements'

export interface SelectDomTarget {
  appSelectId: string
  expectedName: string
}

function findNearestForm(element: Element | null): HTMLFormElement | null {
  if (!element) return null
  return element.closest('form')
}

function ensureSelectName(wrapper: HTMLElement, expectedName: string): void {
  const selectEl = wrapper.querySelector('select')
  if (!selectEl) return
  if (!selectEl.getAttribute('name')) {
    selectEl.setAttribute('name', expectedName)
  }
}

export function patchSelectDomTargets(targets: SelectDomTarget[]): void {
  for (const target of targets) {
    const wrapper = document.getElementById(target.appSelectId)
    if (!wrapper) continue
    ensureSelectName(wrapper, target.expectedName)
    const nearestForm = findNearestForm(wrapper)
    if (nearestForm) patchFormElements(nearestForm)
  }
}


