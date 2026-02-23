/**
 * WHY: CSS Variables Utility

LEARNING: Isolates DOM access for CSS variable ma...
 */
export function setCSSVariable(key: string, value: string): void {
  // PATTERN: Check typeof document before accessing it
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.style.setProperty(key, value)
}

/**
 * WHY: Remove a CSS variable from the document root

LEARNING: Isolates documen...
 */
export function removeCSSVariable(key: string): void {
  // PATTERN: Check typeof document before accessing it
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.style.removeProperty(key)
}
