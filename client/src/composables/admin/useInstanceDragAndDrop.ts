/**
 * Composable for instance drag-and-drop setup
 * WHY: Extracts drag-and-drop initialization logic from InstancesTab
 * PATTERN: Composable that manages drag-and-drop setup watchers and lifecycle
 */

import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount, onUnmounted, isRef, type Ref, type ComputedRef, type ComponentPublicInstance } from 'vue'
import { animations, handleEnd, performTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { useEntityDragHandlers } from './useEntityDragHandlers'
import { useEntityTabState } from './useEntityTabState'
import { getPanelsElement, countDraggableNodes, createMultiClassDraggableChecker, createExpansionPanelDraggableChecker } from './useDragAndDropHelpers'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from './useEntityDragHandlers'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useInstanceDragAndDrop')

export interface UseInstanceDragAndDropOptions {
  mainInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchBlockInstanceOrderIndex: PatchOrderIndex
}

export interface UseInstanceDragAndDropReturn {
  blockInstancesLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  blockInstanceIdsMap: Ref<Map<string, Ref<string[]>>>
  groupContainers: Ref<Map<string, HTMLElement | null>>
  groupPanelsContainers: Ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>
  groupDragHandlers: Ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>
  groupDragInstances: Ref<Map<string, ReturnType<typeof dragAndDrop>>>
  isMounted: Ref<boolean>
}

/**
 * Composable for managing instance drag-and-drop
 * WHY: Centralizes drag-and-drop setup, watchers, and lifecycle management
 * PATTERN: Returns reactive state and manages drag-and-drop initialization
 */
export function useInstanceDragAndDrop(
  options: UseInstanceDragAndDropOptions
): UseInstanceDragAndDropReturn {
  const { mainInstancesByShape, patchBlockInstanceOrderIndex } = options

  /**
   * LEARNING: Reactive arrays for drag-and-drop per BlockShape group
   * WHY: Need mutable arrays that can be reordered during drag operations
   * PATTERN: Maps of ref arrays that sync with computed filtered results (similar to ShapesTab but per group)
   */
  const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())

  /**
   * LEARNING: Template refs for drag-and-drop containers per group
   * WHY: Need DOM references to initialize drag-and-drop for each BlockShape group
   * PATTERN: Maps of container refs (one per BlockShape group)
   */
  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
  const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())

  /**
   * LEARNING: Drag handlers per group
   * WHY: Each BlockShape group needs its own drag handlers
   * PATTERN: Map of drag handlers (one per BlockShape group)
   */
  const groupDragHandlers = ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>(new Map())

  /**
   * LEARNING: Drag-and-drop instances per group
   * WHY: Track drag-and-drop instances for cleanup
   * PATTERN: Map of drag-and-drop instances (one per BlockShape group)
   */
  const groupDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())
  const isMounted = ref(false)

  /**
   * LEARNING: Initialize drag handlers and arrays for each BlockShape group
   * WHY: Set up drag handlers and sync arrays when BlockShapes are available
   * PATTERN: Watch blockInstancesByShape and create handlers/arrays for each group (similar to ShapesTab pattern)
   */
  watch(mainInstancesByShape, (instancesMap) => {
    instancesMap.forEach((instances, blockShapeId) => {
      if (!blockInstancesLists.value.has(blockShapeId)) {
        blockInstancesLists.value.set(blockShapeId, ref([...instances]))
        blockInstanceIdsMap.value.set(blockShapeId, ref(instances.map(i => String(i.id))))
        
        const filteredInstances = computed(() => mainInstancesByShape.value.get(blockShapeId) || [])
        
        const dragHandlers = useEntityDragHandlers({
          entityIds: blockInstanceIdsMap.value.get(blockShapeId)!,
          entityList: blockInstancesLists.value.get(blockShapeId)!,
          filteredEntities: filteredInstances,
          patchOrderIndex: patchBlockInstanceOrderIndex
        })
        groupDragHandlers.value.set(blockShapeId, dragHandlers)
        
        useEntityTabState({
          filteredEntities: filteredInstances,
          dragHandlers
        })
      } else {
        const handlers = groupDragHandlers.value.get(blockShapeId)
        if (handlers) {
          handlers.syncArrays()
        }
      }
    })
  }, { immediate: true, deep: true })

  /**
   * LEARNING: Set up drag-and-drop for each group when containers are available
   * WHY: Initialize drag-and-drop when component mounts and containers are set
   * PATTERN: Watch containers and panels containers, set up drag-and-drop manually (similar to useDragAndDrop pattern)
   */
  watch(() => [groupContainers.value, groupPanelsContainers.value], ([containers, panelsContainers]) => {
    if (!isMounted.value) return
    
    if (!containers || !(containers instanceof Map)) return
    if (!panelsContainers || !(panelsContainers instanceof Map)) return
    
    containers.forEach((container, blockShapeId) => {
      if (!container || !(container instanceof HTMLElement)) return
      
      if (groupDragInstances.value.has(blockShapeId)) return
      
      const instancesList = blockInstancesLists.value.get(blockShapeId)
      const instanceIds = blockInstanceIdsMap.value.get(blockShapeId)
      const dragHandlers = groupDragHandlers.value.get(blockShapeId)
      const panelsRef = panelsContainers.get(blockShapeId)
      
      if (!instancesList || !instanceIds || !dragHandlers || !panelsRef) return
      
      nextTick(() => {
        if (!isMounted.value) return
        
        try {
          const panelsEl = getPanelsElement(isRef(panelsRef) ? panelsRef.value : panelsRef, container)
          if (!panelsEl || !(panelsEl instanceof HTMLElement)) return
          
          const panelsRefForDrag = ref(panelsEl)
          
          const existingInstance = groupDragInstances.value.get(blockShapeId)
          if (existingInstance) {
            groupDragInstances.value.delete(blockShapeId)
          }
          
          // PATTERN: Check values array length before initializing drag-and-drop
          const instanceIdsArray = instanceIds.value
          if (!instanceIdsArray || instanceIdsArray.length === 0) return
          
          // PATTERN: Count draggable nodes and ensure they match values array length
          const draggableClasses = [`draggable-instance-${blockShapeId}`, 'draggable-instance-item']
          // PATTERN: Reuse the same checker function for both validation and drag-and-drop config
          const isDraggableChecker = createMultiClassDraggableChecker(draggableClasses)
          const enabledNodesCount = countDraggableNodes(panelsEl, isDraggableChecker)
          
          if (enabledNodesCount !== instanceIdsArray.length) {
            // PATTERN: Skip initialization and let watcher retry on next update
            return
          }
          
          groupDragInstances.value.set(blockShapeId, dragAndDrop({
            parent: panelsRefForDrag,
            values: instanceIds, // LEARNING: Pass Ref, not plain array
            // PATTERN: Pass the Ref directly, not the .value
            group: `blockInstances-${blockShapeId}`,
            // PATTERN: Extract common logic to shared utility
            draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
            plugins: [animations()],
            performTransfer: (state, data) => {
              performTransfer(state, data)
            },
            handleEnd: (state) => {
              handleEnd(state)
              dragHandlers.handleDragEnd()
            },
          }))
        } catch (error) {
          logger.debug('Failed to initialize drag and drop for group', { error, groupKey })
        }
      })
    })
  }, { immediate: true, deep: true })

  /**
   * LEARNING: Initialize when component mounts
   * WHY: Set mount status to enable drag-and-drop setup
   * PATTERN: Set isMounted flag on mount
   */
  onMounted(() => {
    isMounted.value = true
  })

  /**
   * LEARNING: Cleanup BEFORE component unmount starts
   * WHY: Prevents watchers from running during Vue's unmount process
   * PATTERN: Clear drag instances and set mount status to false
   */
  onBeforeUnmount(() => {
    isMounted.value = false
    groupDragInstances.value.forEach(_instance => {
    })
    groupDragInstances.value.clear()
  })

  /**
   * LEARNING: Final cleanup after component unmount completes
   * WHY: Ensures all Maps are cleared for garbage collection
   * PATTERN: Clear Maps after Vue finishes unmounting
   */
  onUnmounted(() => {
    groupContainers.value.clear()
    groupPanelsContainers.value.clear()
    blockInstancesLists.value.clear()
    blockInstanceIdsMap.value.clear()
    groupDragHandlers.value.clear()
  })

  return {
    blockInstancesLists,
    blockInstanceIdsMap,
    groupContainers,
    groupPanelsContainers,
    groupDragHandlers,
    groupDragInstances,
    isMounted
  }
}
