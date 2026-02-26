/**
 * PATTERN: Composable for instance drag-and-drop setup
PATTERN: Composable that man...
 */
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount, onUnmounted, isRef } from 'vue'
import { animations, handleEnd as formkitHandleEnd, performTransfer as formkitPerformTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { useEntityDragHandlers } from './useEntityDragHandlers'
import { useEntityTabState } from './useEntityTabState'
import { getPanelsElement, countDraggableNodes, createMultiClassDraggableChecker, createExpansionPanelDraggableChecker } from './useDragAndDropHelpers'
import { createLogger } from '@/utils/logger'
import type { GlobalEntity } from '@/types/entities'
import type { UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn } from '@/types/admin/instanceDragAndDrop'

const logger = createLogger('useInstanceDragAndDrop')


/**
 * WHY: Composable for managing instance drag-and-drop
WHY: Centralizes drag-and...
 */
export function useInstanceDragAndDrop(
  options: UseInstanceDragAndDropOptions
): UseInstanceDragAndDropReturn {
  const { mainInstancesByShape, patchBlockInstanceOrderIndex } = options

  const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())

  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
  const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())

  const groupDragHandlers = ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>(new Map())

  const groupDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())
  const isMounted = ref(false)

  /**
   * PATTERN: Watch blockInstancesByShape and create handlers/arrays for each group (similar to ShapesTab pattern)
   */
  watch(mainInstancesByShape, (instancesMap) => {
    instancesMap.forEach((instances, blockShapeId) => {
      if (!blockInstancesLists.value.has(blockShapeId)) {
        blockInstancesLists.value.set(blockShapeId, ref([...instances]))
        blockInstanceIdsMap.value.set(blockShapeId, ref(instances.map(i => i.id)))
        
        const filteredInstances = computed(() => {
          const raw = mainInstancesByShape.value.get(blockShapeId)
          return raw !== undefined ? raw : []
        })
        
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
            values: instanceIds,
            // PATTERN: Pass the Ref directly, not the .value
            group: `blockInstances-${blockShapeId}`,
            // PATTERN: Extract common logic to shared utility
            draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
            plugins: [animations()],
            performTransfer: (arg) => {
              formkitPerformTransfer(arg)
            },
            handleEnd: (state) => {
              formkitHandleEnd(state)
              dragHandlers.handleDragEnd()
            },
          }))
        } catch (error) {
          logger.debug('Failed to initialize drag and drop for group', { error, blockShapeId })
        }
      })
    })
  }, { immediate: true, deep: true })

  onMounted(() => {
    isMounted.value = true
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    groupDragInstances.value.forEach(_instance => {
    })
    groupDragInstances.value.clear()
  })

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
