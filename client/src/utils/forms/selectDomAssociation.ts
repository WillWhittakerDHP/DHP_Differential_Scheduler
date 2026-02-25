import { patchFormElements } from '@/utils/patchFormElements'
import type { SelectDomTarget } from '@/types/forms/selectDomAssociation'

export type { SelectDomTarget } from '@/types/forms/selectDomAssociation'

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


