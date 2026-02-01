/**
 * DOM helpers for drag-and-drop
 * WHY: Extracts DOM manipulation logic from components
 * PATTERN: Pure helper functions for DOM operations
 */

import type { ComponentPublicInstance, Ref } from 'vue'

export function getPanelsElement(
  componentRef: ComponentPublicInstance | HTMLElement | null,
  container: HTMLElement | null,
  isMounted?: Ref<boolean>
): HTMLElement | null {
  // PATTERN: Check mount status and ref validity before accessing
  if (isMounted && !isMounted.value) return null
  if (!componentRef && !container) return null
  
  try {
    const componentEl = (componentRef && typeof componentRef === 'object' && '$el' in componentRef) 
      ? (componentRef as ComponentPublicInstance).$el || componentRef 
      : componentRef
    
    const panelsEl = componentEl?.querySelector?.('.v-expansion-panels') || componentEl
    
    if (!panelsEl && container) {
      return container.querySelector('.v-expansion-panels') as HTMLElement | null
    }
    
    return panelsEl as HTMLElement | null
  } catch {
    // PATTERN: Return null on error to gracefully handle unmount scenarios
    return null
  }
}

/**
 * Count draggable DOM nodes matching the specified criteria
 * WHY: Prevents "number of enabled nodes does not match number of values" error
 *      when drag-and-drop initializes before DOM nodes are rendered
 * PATTERN: Count draggable nodes and ensure they match values array length
 * 
 * @param panelsEl - The panels container element
 * @param isDraggable - Function that returns true if a node should be counted as draggable
 * @returns The count of enabled draggable nodes
 */
export function countDraggableNodes(
  panelsEl: HTMLElement,
  isDraggable: (node: Element) => boolean
): number {
  const allPanels = panelsEl.querySelectorAll('.v-expansion-panel')
  return Array.from(allPanels).filter(node => {
    const el = node as HTMLElement
    return el.classList?.contains('v-expansion-panel') && isDraggable(el)
  }).length
}

export function createSingleClassDraggableChecker(draggableClass: string): (node: Element) => boolean {
  return (node: Element) => {
    const el = node as HTMLElement
    return el.classList?.contains(draggableClass)
  }
}

export function createMultiClassDraggableChecker(draggableClasses: string[]): (node: Element) => boolean {
  return (node: Element) => {
    const el = node as HTMLElement
    return draggableClasses.some(className => el.classList?.contains(className))
  }
}

/**
 * LEARNING: Shared draggable checker function for expansion panels
 * WHY: Eliminates duplication between useDragAndDrop and useInstanceDragAndDrop
 * PATTERN: Extract common draggable logic to shared utility
 * 
 * @param isDraggableChecker - Function to check if a panel element is draggable
 * @returns Function that checks if a child element's panel is draggable
 */
export function createExpansionPanelDraggableChecker(
  isDraggableChecker: (element: HTMLElement) => boolean
): (child: unknown) => boolean {
  return (child: unknown) => {
    if (!child) return false
    
    // PATTERN: Check if child itself is a panel, otherwise find closest ancestor
    const childEl = child as HTMLElement
    const panelElement = childEl.classList?.contains('v-expansion-panel') 
      ? childEl 
      : childEl.closest?.('.v-expansion-panel') as HTMLElement | null
    
    if (!panelElement) return false
    
    // LEARNING: Use the same checker logic as node counting
    // PATTERN: Reuse the same checker function
    return isDraggableChecker(panelElement)
  }
}
