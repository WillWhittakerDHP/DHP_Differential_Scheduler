/**
 * WHY: useDragAndDrop Composable
 * WHY: Moves drag-and-drop initialization, hand...
 */
import { ref, watch, onMounted, onBeforeUnmount, onUnmounted, nextTick, type Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import {
  useDragAndDropInstance,
  type MountDragAndDropOnPanelsParams,
} from '@/composables/admin/useMountDragAndDropOnPanelsIfReady'
import type { UseDragAndDropParams, UseDragAndDropReturn } from '@/types/admin/dragAndDrop'

function scheduleMountWhenReady(params: MountDragAndDropOnPanelsParams): void {
  nextTick(() => {
    if (!params.isMounted.value) {
      return
    }
    useDragAndDropInstance(params)
  })
}

type MountDragRest = Pick<
  MountDragAndDropOnPanelsParams,
  'entityIds' | 'group' | 'draggableClass' | 'dragHandle' | 'dragEndHandler'
>

function runContainerPanelsWatchEffect(
  isMounted: Ref<boolean>,
  container: unknown,
  panelsComponentRef: unknown,
  mountRest: MountDragRest
): void {
  if (!isMounted.value || !container) {
    return
  }
  if (!(container instanceof HTMLElement)) {
    return
  }
  scheduleMountWhenReady({
    container,
    panelsComponentRef: panelsComponentRef as ComponentPublicInstance | HTMLElement | null,
    isMounted,
    ...mountRest,
  })
}

/**
 * WHY: useDragAndDrop composable
 * WHY: Extracts drag-and-drop logic from compon...
 */
export function useDragAndDrop(params: UseDragAndDropParams): UseDragAndDropReturn {
  const { containerRef, panelsContainerRef, entityIds, dragEndHandler, group, draggableClass, dragHandle } =
    params

  const isMounted = ref(false)
  const watcherStop = ref<(() => void) | null>(null)

  const mountRest: MountDragRest = {
    entityIds,
    group,
    draggableClass,
    dragHandle,
    dragEndHandler,
  }

  onMounted(() => {
    isMounted.value = true

    watcherStop.value = watch(
      [containerRef, panelsContainerRef],
      ([container, panelsComponentRef]) => {
        runContainerPanelsWatchEffect(isMounted, container, panelsComponentRef, mountRest)
      },
      { immediate: true }
    )
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    watcherStop.value?.()
  })

  onUnmounted(() => {
    containerRef.value = null
    panelsContainerRef.value = null
  })

  return {
    isMounted,
  }
}
