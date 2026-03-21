import type { ComponentPublicInstance, Ref } from 'vue'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useDragAndDropHelpers')

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
  } catch (err) {
    logger.warn('getPanelsElement failed', { error: err })
    return null
  }
}

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
    
    // PATTERN: Reuse the same checker function
    return isDraggableChecker(panelElement)
  }
}
