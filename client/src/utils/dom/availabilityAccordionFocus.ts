/**
 * Focus helpers for availability step accordion (DOM isolated from composable audit scope).
 */
import { nextTick } from 'vue'

const SLOT_STEP_INDICES = new Set([3, 4])

function getElementByIdSafe(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.getElementById(id)
}

export function focusFirstFocusableInContent(stepIndex: number, contentIdPrefix: string): void {
  void nextTick(() => {
    const contentEl = getElementByIdSafe(`${contentIdPrefix}${stepIndex}`)
    if (!contentEl) return
    const slotStep = SLOT_STEP_INDICES.has(stepIndex)
    const firstSlot = slotStep
      ? contentEl.querySelector<HTMLElement>('.appointment-slot-btn:not([disabled])')
      : null
    const focusable =
      firstSlot ??
      contentEl.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    if (focusable) {
      focusable.focus()
      focusable.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

export function focusAccordionHeader(stepIndex: number, titleIdPrefix: string): void {
  const headerEl = getElementByIdSafe(`${titleIdPrefix}${stepIndex}`)
  headerEl?.focus()
}
