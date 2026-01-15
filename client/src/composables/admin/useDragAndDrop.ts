/**
 * useDragAndDrop Composable
 * 
 * LEARNING: Extracts drag-and-drop logic from ShapesTab component
 * WHY: Moves drag-and-drop initialization, handlers, and cleanup to composable
 * PATTERN: Composable that provides drag-and-drop setup and handlers
 */

import { ref, watch, onMounted, onBeforeUnmount, onUnmounted, nextTick, type Ref, type ComponentPublicInstance, type ComputedRef } from 'vue'
import { animations, handleEnd, performTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { GlobalEntity } from '@/types/entities'

/**
 * Drag-and-drop handler function type
 */
export type DragEndHandler = () => Promise<void>

/**
 * useDragAndDrop composable parameters
 */
export interface UseDragAndDropParams {
  containerRef: Ref<HTMLElement | null>
  panelsContainerRef: Ref<ComponentPublicInstance | HTMLElement | null>
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<'blockShape'>[] | GlobalEntity<'partShape'>[]>
  filteredEntities: ComputedRef<GlobalEntity<'blockShape'>[] | GlobalEntity<'partShape'>[]>
  dragEndHandler: DragEndHandler
  group: string
  draggableClass: string
}

/**
 * useDragAndDrop composable return type
 */
export interface UseDragAndDropReturn {
  isMounted: Ref<boolean>
}

/**
 * Helper to get actual DOM element from VExpansionPanels component ref
 * WHY: Component refs give us component instances, we need the .v-expansion-panels DOM element
 * PATTERN: Access .$el property of component instance, then find .v-expansion-panels child
 */
function getPanelsElement(
  componentRef: ComponentPublicInstance | HTMLElement | null,
  containerRef: HTMLElement | null,
  isMounted: Ref<boolean>
): HTMLElement | null {
  // LEARNING: Guard against accessing refs during unmount
  // WHY: Prevents errors when component is being unmounted by VWindow
  // PATTERN: Check mount status and ref validity before accessing
  if (!isMounted.value) return null
  if (!componentRef && !containerRef) return null
  
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
    if (!panelsEl && containerRef) {
      return containerRef.querySelector('.v-expansion-panels') as HTMLElement | null
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
 * useDragAndDrop composable
 * 
 * LEARNING: Provides drag-and-drop setup and handlers
 * WHY: Extracts drag-and-drop logic from component to composable
 * PATTERN: Composable that sets up drag-and-drop and returns mount state
 */
export function useDragAndDrop(params: UseDragAndDropParams): UseDragAndDropReturn {
  const {
    containerRef,
    panelsContainerRef,
    entityIds,
    // entityList and filteredEntities are passed for type completeness but not directly used
    // (they're accessed through entityIds which is derived from them)
    dragEndHandler,
    group,
    draggableClass
  } = params

  /**
   * LEARNING: Track mount status to prevent operations after unmount
   * WHY: Guards against accessing DOM refs that Vue is unmounting
   * PATTERN: Use ref flag to track component lifecycle state
   */
  const isMounted = ref(false)

  /**
   * LEARNING: Store watcher stop function for cleanup
   * WHY: Vue's watch() returns a stop function that must be called to prevent memory leaks
   * PATTERN: Store stop function in ref to call it in onBeforeUnmount
   */
  const watcherStop = ref<(() => void) | null>(null)

  onMounted(() => {
    isMounted.value = true
    
    // Set up drag-and-drop
    watcherStop.value = watch([containerRef, panelsContainerRef], ([container, panelsComponentRef]) => {
      // LEARNING: Guard against accessing refs after unmount
      // WHY: Prevents errors when VWindow switches tabs and components unmount
      // PATTERN: Check mount status before DOM manipulation
      if (!isMounted.value || !container) return
      
      // LEARNING: Ensure container is a valid DOM element
      // WHY: Prevents errors if ref is not yet assigned or has been cleared
      // PATTERN: Check that container is an HTMLElement before proceeding
      if (!(container instanceof HTMLElement)) return
      
      nextTick(() => {
        // Double-check mount status after nextTick (component might have unmounted)
        if (!isMounted.value) return
        
        try {
          // Get the actual .v-expansion-panels DOM element
          const panelsEl = getPanelsElement(panelsComponentRef, container, isMounted)
          if (!panelsEl || !(panelsEl instanceof HTMLElement)) return
          
          // Create a ref for the actual DOM element
          const panelsRef = ref(panelsEl)
          
          // Set up drag-and-drop instance
          // NOTE: @formkit/drag-and-drop handles cleanup automatically when DOM elements are removed
          dragAndDrop({
            parent: panelsRef,
            values: entityIds,
            group,
            draggable: (child) => {
              if (!child) return false
              
              // Check if element is a VExpansionPanel with our draggable class
              return child.classList?.contains('v-expansion-panel') && 
                     child.classList?.contains(draggableClass)
            },
            plugins: [animations()],
            performTransfer: (state, data) => {
              performTransfer(state, data)
            },
            handleEnd: (state) => {
              handleEnd(state)
              dragEndHandler()
            },
          })
        } catch (error) {
          // LEARNING: Catch errors during drag-and-drop setup
          // WHY: Prevents errors from propagating when component is being mounted/unmounted
          // PATTERN: Silently handle error to prevent breaking Vue's mount process
        }
      })
    }, { immediate: true })
  })

  /**
   * LEARNING: Cleanup BEFORE component unmount starts
   * WHY: Prevents watchers from running during Vue's unmount process
   * PATTERN: Use onBeforeUnmount to stop watchers before Vue starts unmounting
   */
  onBeforeUnmount(() => {
    // Mark as unmounted immediately to prevent any watcher callbacks from running
    isMounted.value = false
    
    // Stop watchers immediately (they might trigger during transition if not stopped first)
    watcherStop.value?.()
  })

  /**
   * LEARNING: Final cleanup after component unmount completes
   * WHY: Ensures all refs are cleared for garbage collection
   * PATTERN: Use onUnmounted for final cleanup after Vue finishes unmounting
   */
  onUnmounted(() => {
    // Clear refs to help Vue's garbage collection
    containerRef.value = null
    panelsContainerRef.value = null
  })

  return {
    isMounted
  }
}

