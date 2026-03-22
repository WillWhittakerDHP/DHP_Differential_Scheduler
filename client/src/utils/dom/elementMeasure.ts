/**
 * SSR-safe DOM measurement: content width of an element (excluding padding).
 * WHY: Isolates window.getComputedStyle and getBoundingClientRect for testability and composables-logic audit (no direct DOM in composable).
 */
export function getContentWidth(element: HTMLElement): number {
  if (typeof window === 'undefined') return 0
  const rect = element.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(element)
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0
  const measuredWidth = rect.width - paddingLeft - paddingRight
  return measuredWidth > 0 ? measuredWidth : 0
}
