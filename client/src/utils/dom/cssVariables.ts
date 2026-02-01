/**
 * CSS Variables Utility
 * 
 * LEARNING: Isolates DOM access for CSS variable manipulation
 * WHY: Keeps DOM access out of composables for better testability
 * PATTERN: Pure utility functions that handle SSR safety
 * 
 * These utilities manipulate CSS custom properties (CSS variables) on the document root.
 */

/**
 * Set a CSS variable on the document root
 * 
 * LEARNING: Isolates document.documentElement.style.setProperty
 * WHY: Makes composables testable without direct DOM access
 * PATTERN: Check SSR safety before accessing document
 * 
 * @param key - The CSS variable name (e.g., '--v-theme-primary')
 * @param value - The CSS variable value (e.g., '255, 0, 0' for RGB)
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
 * Remove a CSS variable from the document root
 * 
 * LEARNING: Isolates document.documentElement.style.removeProperty
 * WHY: Makes composables testable without direct DOM access
 * PATTERN: Check SSR safety before accessing document
 * 
 * @param key - The CSS variable name to remove (e.g., '--v-theme-primary')
 */
export function removeCSSVariable(key: string): void {
  // PATTERN: Check typeof document before accessing it
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.style.removeProperty(key)
}
