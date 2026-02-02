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
import { getPanelsElement, countDraggableNodes, createSingleClassDraggableChecker, createExpansionPanelDraggableChecker } from './useDragAndDropHelpers'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useDragAndDrop')

export type DragEndHandler = () => Promise<void>

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

export interface UseDragAndDropReturn {
  isMounted: Ref<boolean>
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
    
    watcherStop.value = watch([containerRef, panelsContainerRef], ([container, panelsComponentRef]) => {
      // PATTERN: Check mount status before DOM manipulation
      if (!isMounted.value || !container) return
      
      // PATTERN: Check that container is an HTMLElement before proceeding
      if (!(container instanceof HTMLElement)) return
      
      nextTick(() => {
        if (!isMounted.value) return
        
        try {
          const panelsEl = getPanelsElement(panelsComponentRef, container, isMounted)
          if (!panelsEl || !(panelsEl instanceof HTMLElement)) return
          
          // PATTERN: Count draggable nodes and ensure they match values array length
          const entityIdsArray = entityIds.value
          if (!entityIdsArray || entityIdsArray.length === 0) return
          
          // PATTERN: Reuse the same checker function for both validation and drag-and-drop config
          const isDraggableChecker = createSingleClassDraggableChecker(draggableClass)
          const enabledNodesCount = countDraggableNodes(panelsEl, isDraggableChecker)
          
          if (enabledNodesCount !== entityIdsArray.length) {
            // PATTERN: Skip initialization and let watcher retry on next update
            return
          }
          
          const panelsRef = ref(panelsEl)
          
          dragAndDrop({
            parent: panelsRef,
            values: entityIds,
            group,
            // PATTERN: Extract common logic to shared utility
            draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
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
          // PATTERN: Handle error gracefully to prevent breaking Vue's mount process, but log for debugging
          logger.debug('Failed to initialize drag and drop', { error, group })
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
    
    watcherStop.value?.()
  })

  /**
   * LEARNING: Final cleanup after component unmount completes
   * WHY: Ensures all refs are cleared for garbage collection
   * PATTERN: Use onUnmounted for final cleanup after Vue finishes unmounting
   */
  onUnmounted(() => {
    containerRef.value = null
    panelsContainerRef.value = null
  })

  return {
    isMounted
  }
}

