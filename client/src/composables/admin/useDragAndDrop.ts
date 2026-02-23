/**
 * WHY: useDragAndDrop Composable

WHY: Moves drag-and-drop initialization, hand...
 */
import { ref, watch, onMounted, onBeforeUnmount, onUnmounted, nextTick, type Ref, type ComponentPublicInstance, type ComputedRef } from 'vue'
import { animations, handleEnd as formkitHandleEnd, performTransfer as formkitPerformTransfer } from '@formkit/drag-and-drop'
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
 * WHY: useDragAndDrop composable

WHY: Extracts drag-and-drop logic from compon...
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
   * PATTERN: Use ref flag to track component lifecycle state
   */
  const isMounted = ref(false)

  /**
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
            performTransfer: (arg) => {
              formkitPerformTransfer(arg)
            },
            handleEnd: (state) => {
              formkitHandleEnd(state)
              dragEndHandler()
            },
          })
        } catch (error) {
          logger.error('Failed to initialize drag and drop', { error, group })
        }
      })
    }, { immediate: true })
  })

  /**
   */
  onBeforeUnmount(() => {
    // Mark as unmounted immediately to prevent any watcher callbacks from running
    isMounted.value = false
    
    watcherStop.value?.()
  })

  /**
   */
  onUnmounted(() => {
    containerRef.value = null
    panelsContainerRef.value = null
  })

  return {
    isMounted
  }
}

