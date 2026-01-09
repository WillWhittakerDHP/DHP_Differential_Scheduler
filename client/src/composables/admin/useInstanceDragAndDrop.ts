/**
 * Instance Drag and Drop Composable
 * 
 * LEARNING: Extracts drag-and-drop logic from InstancesTab component
 * WHY: Components should be thin UI wrappers - drag-and-drop logic belongs in composables
 * PATTERN: Composable that provides drag-and-drop state and operations
 * 
 * This composable handles:
 * - Drag-and-drop ref arrays per group
 * - Container refs per group
 * - Drag-and-drop initialization
 * - Drag end handling
 * - Lifecycle cleanup
 */

import { ref, watch, nextTick, type ComputedRef, type Ref } from 'vue'
import { animations, handleEnd, performTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { useEntityCrud } from '../useEntity'
import type { GlobalEntity } from '@/types/entities'

/**
 * Instance Drag and Drop Composable Options
 */
export interface UseInstanceDragAndDropOptions {
  /**
   * BlockInstances grouped by BlockShape
   */
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
}

/**
 * Instance Drag and Drop Composable Return Type
 */
export interface UseInstanceDragAndDropReturn {
  /**
   * Group instance lists (ref arrays per group)
   */
  groupInstanceLists: Ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>
  
  /**
   * Group instance ID lists (ref arrays per group)
   */
  groupInstanceIdLists: Ref<Map<string, Ref<string[]>>>
  
  /**
   * Group container refs
   */
  groupContainers: Ref<Map<string, HTMLElement | null>>
  
  /**
   * Helper function to get refs for a group
   */
  getGroupRefs: (blockShapeId: string) => {
    instances: Ref<GlobalEntity<'blockInstance'>[]>
    ids: Ref<string[]>
  }
  
  /**
   * Handle drag end for BlockInstances within a group
   */
  handleInstanceDragEnd: (blockShapeId: string) => Promise<void>
  
  /**
   * Initialize drag-and-drop (call in onMounted)
   */
  initializeDragAndDrop: () => void
  
  /**
   * Cleanup before unmount (call in onBeforeUnmount)
   */
  cleanupBeforeUnmount: () => void
  
  /**
   * Cleanup after unmount (call in onUnmounted)
   */
  cleanupAfterUnmount: () => void
}

/**
 * Instance Drag and Drop Composable
 * 
 * LEARNING: Provides drag-and-drop logic extracted from InstancesTab component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with drag-and-drop state and lifecycle management
 */
export function useInstanceDragAndDrop(
  options: UseInstanceDragAndDropOptions
): UseInstanceDragAndDropReturn {
  const { blockInstancesByShape } = options
  
  const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

  /**
   * LEARNING: Reactive maps for drag-and-drop per group (refs created in watcher, not computed)
   * WHY: Need mutable ref arrays for each BlockShape group that can be reordered
   * PATTERN: Map of BlockShape ID to ref arrays - refs created in watcher (not computed) to avoid side effects
   * NOTE: Refs are needed for drag-and-drop values binding, but creation happens in watcher, not computed
   */
  const groupInstanceLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const groupInstanceIdLists = ref<Map<string, Ref<string[]>>>(new Map())
  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())

  /**
   * LEARNING: Track drag-and-drop instances per group
   * WHY: Need to track instances to avoid recreating unnecessarily
   * PATTERN: Map of blockShapeId to drag instance
   */
  const instanceDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())

  /**
   * LEARNING: Track mount status to prevent operations after unmount
   * WHY: Guards against accessing DOM refs that Vue is unmounting
   * PATTERN: Use ref flag to track component lifecycle state
   */
  const isMounted = ref(false)

  /**
   * LEARNING: Store watcher stop functions for cleanup
   * WHY: Vue's watch() returns a stop function that must be called to prevent memory leaks
   * PATTERN: Store stop functions in refs to call them in cleanup
   */
  const groupedInstancesWatcherStop = ref<(() => void) | null>(null)
  const instanceWatcherStop = ref<(() => void) | null>(null)

  /**
   * LEARNING: Helper function to get refs for a group (for script use only)
   * WHY: Need ref arrays for each BlockShape group for drag-and-drop
   * PATTERN: Returns refs from Maps (refs created in watcher, not during render)
   * NOTE: Refs are already created by watcher, so this is just a lookup
   */
  const getGroupRefs = (blockShapeId: string): {
    instances: Ref<GlobalEntity<'blockInstance'>[]>
    ids: Ref<string[]>
  } => {
    // Ensure refs exist (should already exist from watcher, but guard for safety)
    if (!groupInstanceLists.value.has(blockShapeId)) {
      const instances = blockInstancesByShape.value.get(blockShapeId) || []
      groupInstanceLists.value.set(blockShapeId, ref([...instances]))
      groupInstanceIdLists.value.set(blockShapeId, ref(instances.map(p => String(p.id))))
    }
    return {
      instances: groupInstanceLists.value.get(blockShapeId)!,
      ids: groupInstanceIdLists.value.get(blockShapeId)!
    }
  }

  /**
   * LEARNING: Helper to get actual DOM element from container
   * WHY: VExpansionPanels component creates .v-expansion-panels element that contains the panels
   * PATTERN: Find .v-expansion-panels element within container
   */
  const getPanelsElement = (container: HTMLElement | null): HTMLElement | null => {
    if (!isMounted.value) return null
    if (!container) return null
    
    try {
      // Find the .v-expansion-panels element (this is where the actual panels are)
      return container.querySelector('.v-expansion-panels') as HTMLElement | null
    } catch {
      // LEARNING: Catch errors during unmount
      // WHY: Prevents errors from propagating when component is being destroyed
      // PATTERN: Return null on error to gracefully handle unmount scenarios
      return null
    }
  }

  /**
   * LEARNING: Sync reactive arrays with grouped results (side effect watcher, matches ShapesTab pattern)
   * WHY: Keep drag-and-drop ref arrays in sync with grouped/sorted results
   * PATTERN: Watch computed and create/update refs in Maps - this is a side effect (creating/updating refs), so watcher is appropriate
   * NOTE: Refs are created here (not in computed) to avoid side effects in computed properties
   *       Template accesses refs via Maps, drag-and-drop uses refs directly
   */
  groupedInstancesWatcherStop.value = watch(blockInstancesByShape, (map) => {
    map.forEach((instances, blockShapeId) => {
      // Create refs if they don't exist
      if (!groupInstanceLists.value.has(blockShapeId)) {
        groupInstanceLists.value.set(blockShapeId, ref([...instances]))
        groupInstanceIdLists.value.set(blockShapeId, ref(instances.map(p => String(p.id))))
      } else {
        // Update existing refs
        groupInstanceLists.value.get(blockShapeId)!.value = [...instances]
        groupInstanceIdLists.value.get(blockShapeId)!.value = instances.map(p => String(p.id))
      }
    })
  }, { immediate: true })

  /**
   * LEARNING: Handle drag end for BlockInstances within a group
   * WHY: Updates orderIndex values after drag-and-drop operation within a BlockShape group
   * PATTERN: Reorder array based on new ID order, normalize indices, sync to backend (matches ShapesTab pattern)
   */
  const handleInstanceDragEnd = async (blockShapeId: string): Promise<void> => {
    try {
      const refs = getGroupRefs(blockShapeId)
      const instanceIds = refs.ids.value
      const instances = refs.instances.value
      
      if (!instanceIds.length || !instances.length) return
      
      // Reorder entities based on new ID order
      const reordered = instanceIds.map(id => 
        instances.find(p => String(p.id) === id)!
      ).filter(Boolean)
      
      // Normalize orderIndex values
      const normalized = reordered.map((entity, index) => ({
        ...entity,
        orderIndex: index
      }))
      
      // Update local refs
      refs.instances.value = normalized
      
      // Sync to backend - only update instances in this group
      const updates = normalized.map((entity, index) => ({
        id: entity.id,
        orderIndex: index
      }))
      
      await patchBlockInstanceOrderIndex(updates)
    } catch (error) {
      // Revert to original order on error
      const instances = blockInstancesByShape.value.get(blockShapeId) || []
      const refs = getGroupRefs(blockShapeId)
      refs.instances.value = [...instances]
      refs.ids.value = instances.map(p => String(p.id))
    }
  }

  /**
   * LEARNING: Initialize drag-and-drop for each BlockInstance group
   * WHY: Set up drag-and-drop when component mounts and containers are available
   * PATTERN: Use watch containers refs with lifecycle guards
   * NOTE: This watcher is necessary for side effects (DOM manipulation, drag-and-drop initialization), not for reactive data access
   */
  const initializeDragAndDrop = (): void => {
    isMounted.value = true
    
    instanceWatcherStop.value = watch(() => Array.from(groupContainers.value.entries()), (containers) => {
      // LEARNING: Guard against accessing refs after unmount
      // WHY: Prevents errors when VWindow switches tabs and components unmount
      // PATTERN: Check mount status before DOM manipulation
      if (!isMounted.value) return
      
      containers.forEach(([blockShapeId, container]) => {
        if (!container) return
        
        // LEARNING: Ensure container is a valid DOM element
        // WHY: Prevents errors if ref is not yet assigned or has been cleared
        // PATTERN: Check that container is an HTMLElement before proceeding
        if (!(container instanceof HTMLElement)) return
        
        const refs = getGroupRefs(blockShapeId)
        if (!refs.ids.value.length) return
        
        // Clean up previous instance if it exists
        if (instanceDragInstances.value.has(blockShapeId)) {
          instanceDragInstances.value.delete(blockShapeId)
        }
        
        nextTick(() => {
          // Double-check mount status after nextTick (component might have unmounted)
          if (!isMounted.value) return
          
          try {
            // Get the actual .v-expansion-panels DOM element
            const panelsEl = getPanelsElement(container)
            if (!panelsEl || !(panelsEl instanceof HTMLElement)) return
            
            // Create a ref for the actual DOM element
            const panelsRef = ref(panelsEl)
            
            instanceDragInstances.value.set(blockShapeId, dragAndDrop({
              parent: panelsRef,
              values: refs.ids,
              group: `blockInstances-${blockShapeId}`,
              draggable: (child) => {
                if (!child) return false
                
                // LEARNING: Check if element is a VExpansionPanel with our draggable class
                // WHY: Need to support drag handles on expansion panels
                // PATTERN: Check for v-expansion-panel class and draggable-instance class
                const isDraggablePanel = child.classList?.contains('v-expansion-panel') && 
                                          (child.classList?.contains(`draggable-instance-${blockShapeId}`) ||
                                           child.classList?.contains('draggable-instance-item'))
                
                // Also check if it's the drag handle icon
                const isDragHandle = child.classList?.contains('drag-handle') ||
                                     child.closest?.('.drag-handle') !== null
                
                return isDraggablePanel || isDragHandle
              },
              plugins: [animations()],
              performTransfer: (state, data) => {
                performTransfer(state, data)
              },
              handleEnd: (state) => {
                handleEnd(state)
                handleInstanceDragEnd(blockShapeId)
              },
            }))
          } catch (error) {
            // LEARNING: Catch errors during drag-and-drop setup
            // WHY: Prevents errors from propagating when component is being mounted/unmounted
            // PATTERN: Silently handle error to prevent breaking Vue's mount process
          }
        })
      })
    }, { immediate: true, deep: true })
  }

  /**
   * LEARNING: Cleanup BEFORE component unmount starts
   * WHY: Prevents watcher from running during Vue's unmount process
   * PATTERN: Stop watchers and clear drag instances
   */
  const cleanupBeforeUnmount = (): void => {
    // Mark as unmounted immediately to prevent any watcher callbacks from running
    isMounted.value = false
    
    // Stop watchers immediately (they might trigger during transition if not stopped first)
    instanceWatcherStop.value?.()
    groupedInstancesWatcherStop.value?.()
    
    // Clear all drag instances to prevent DOM manipulation during unmount
    instanceDragInstances.value.clear()
  }

  /**
   * LEARNING: Final cleanup after component unmount completes
   * WHY: Ensures all Maps are cleared for garbage collection
   * PATTERN: Clear Maps after Vue finishes unmounting
   */
  const cleanupAfterUnmount = (): void => {
    // Clear Maps to help Vue's garbage collection
    groupContainers.value.clear()
    groupInstanceLists.value.clear()
    groupInstanceIdLists.value.clear()
  }

  return {
    groupInstanceLists,
    groupInstanceIdLists,
    groupContainers,
    getGroupRefs,
    handleInstanceDragEnd,
    initializeDragAndDrop,
    cleanupBeforeUnmount,
    cleanupAfterUnmount
  }
}

