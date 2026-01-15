/**
 * DOM helpers for drag-and-drop
 * WHY: Extracts DOM manipulation logic from components
 * PATTERN: Pure helper functions for DOM operations
 */

import type { ComponentPublicInstance } from 'vue'
import { isRef } from 'vue'

/**
 * Get panels element from container ref
 * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
 * PATTERN: Extract the actual DOM container element from component ref
 */
export function getPanelsElement(
  componentRef: ComponentPublicInstance | HTMLElement | null,
  container: HTMLElement | null
): HTMLElement | null {
  if (!componentRef || !container) {
    return null
  }

  // Handle both component instances and direct HTMLElement refs
  const componentEl = (componentRef && typeof componentRef === 'object' && '$el' in componentRef)
    ? (componentRef.$el as HTMLElement | null)
    : (componentRef as HTMLElement | null)

  // Find .v-expansion-panels element within component, or use component element itself
  const panelsEl = componentEl?.querySelector?.('.v-expansion-panels') || componentEl

  return panelsEl || null
}
