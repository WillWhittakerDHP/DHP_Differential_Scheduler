/** Returns the currently focused element in the browser, or null (SSR-safe). */
export function getActiveElement(): Element | null {
  if (typeof document === 'undefined') return null
  return document.activeElement
}
