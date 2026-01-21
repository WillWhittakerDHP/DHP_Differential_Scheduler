/**
 * DOM helpers for drag-and-drop
 * WHY: Extracts DOM manipulation logic from components
 * PATTERN: Pure helper functions for DOM operations
 */

import type { ComponentPublicInstance, Ref } from 'vue'

/**
 * Get panels element from container ref
 * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
 * PATTERN: Extract the actual DOM container element from component ref
 * 
 * @param componentRef - Component instance or HTMLElement ref
 * @param container - Container HTMLElement (optional, used as fallback)
 * @param isMounted - Optional mount status ref to guard against unmount access
 * @returns The .v-expansion-panels DOM element or null
 */
export function getPanelsElement(
  componentRef: ComponentPublicInstance | HTMLElement | null,
  container: HTMLElement | null,
  isMounted?: Ref<boolean>
): HTMLElement | null {
  // LEARNING: Guard against accessing refs during unmount
  // WHY: Prevents errors when component is being unmounted by VWindow
  // PATTERN: Check mount status and ref validity before accessing
  if (isMounted && !isMounted.value) return null
  if (!componentRef && !container) return null
  
  try {
    // If componentRef is a component instance, get its $el
    // LEARNING: Safe access with optional chaining and null checks
    // WHY: $el might be undefined during component unmount
    const componentEl = (componentRef && typeof componentRef === 'object' && '$el' in componentRef) 
      ? (componentRef as ComponentPublicInstance).$el || componentRef 
      : componentRef
    
    // Find the .v-expansion-panels element (this is where the actual panels are)
    const panelsEl = componentEl?.querySelector?.('.v-expansion-panels') || componentEl
    
    // Fallback to searching in container
    if (!panelsEl && container) {
      return container.querySelector('.v-expansion-panels') as HTMLElement | null
    }
    
    return panelsEl as HTMLElement | null
  } catch {
    // LEARNING: Catch errors during unmount
    // WHY: Prevents errors from propagating when component is being destroyed
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

/**
 * Create a draggable checker function for a single class
 * WHY: Simplifies creating isDraggable functions for single-class scenarios
 * PATTERN: Factory function that returns a class-based checker
 * 
 * @param draggableClass - The CSS class that marks an element as draggable
 * @returns Function that checks if an element has the draggable class
 */
export function createSingleClassDraggableChecker(draggableClass: string): (node: Element) => boolean {
  return (node: Element) => {
    const el = node as HTMLElement
    return el.classList?.contains(draggableClass)
  }
}

/**
 * Create a draggable checker function for multiple classes (OR logic)
 * WHY: Simplifies creating isDraggable functions for multi-class scenarios
 * PATTERN: Factory function that returns a multi-class checker
 * 
 * @param draggableClasses - Array of CSS classes, element matches if it has any of them
 * @returns Function that checks if an element has any of the draggable classes
 */
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
    
    // LEARNING: Find the .v-expansion-panel element (child or its ancestor)
    // WHY: The child might be a nested element (button, text, etc.) inside the panel
    // PATTERN: Check if child itself is a panel, otherwise find closest ancestor
    const childEl = child as HTMLElement
    const panelElement = childEl.classList?.contains('v-expansion-panel') 
      ? childEl 
      : childEl.closest?.('.v-expansion-panel') as HTMLElement | null
    
    if (!panelElement) return false
    
    // LEARNING: Use the same checker logic as node counting
    // WHY: Ensures consistency between validation and actual drag behavior
    // PATTERN: Reuse the same checker function
    return isDraggableChecker(panelElement)
  }
}
