/**
 * WHY: useDragAndDrop Composable
 * WHY: Moves drag-and-drop initialization, hand...
 */
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
  toValue,
  type Ref,
} from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { tearDown as formkitTearDown } from '@formkit/drag-and-drop'
import {
  useMountDragAndDropOnPanelsIfReady,
  type MountDragAndDropOnPanelsParams,
} from '@/composables/admin/useMountDragAndDropOnPanelsIfReady'
import type { UseDragAndDropParams, UseDragAndDropReturn } from '@/types/admin/dragAndDrop'

function scheduleMountWhenReady(
  params: MountDragAndDropOnPanelsParams,
  onResult: (panelsEl: HTMLElement | null) => void
): void {
  nextTick(() => {
    if (!params.isMounted.value) {
      onResult(null)
      return
    }
    const el = useMountDragAndDropOnPanelsIfReady(params)
    onResult(el)
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
  mountRest: MountDragRest,
  onResult: (panelsEl: HTMLElement | null) => void
): void {
  if (!isMounted.value || !container) {
    onResult(null)
    return
  }
  if (!(container instanceof HTMLElement)) {
    onResult(null)
    return
  }
  scheduleMountWhenReady(
    {
      container,
      panelsComponentRef: panelsComponentRef as ComponentPublicInstance | HTMLElement | null,
      isMounted,
      ...mountRest,
    },
    onResult
  )
}

/**
 * WHY: useDragAndDrop composable
 * WHY: Extracts drag-and-drop initialization, hand...
 */
export function useDragAndDrop(params: UseDragAndDropParams): UseDragAndDropReturn {
  const {
    containerRef,
    panelsContainerRef,
    entityIds,
    dragEndHandler,
    group,
    draggableClass,
    dragHandle,
    visibilityDeps,
    shouldBind,
  } = params

  const isMounted = ref(false)
  const watcherStop = ref<(() => void) | null>(null)
  let lastBoundPanelsEl: HTMLElement | null = null

  const tearDownIfBound = (): void => {
    if (lastBoundPanelsEl) {
      formkitTearDown(lastBoundPanelsEl)
      lastBoundPanelsEl = null
    }
  }

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
      () => {
        const extra = visibilityDeps !== undefined ? [...toValue(visibilityDeps)] : []
        const bind =
          shouldBind === undefined ? true : (toValue(shouldBind) as boolean)
        return [containerRef.value, panelsContainerRef.value, bind, ...extra] as const
      },
      () => {
        tearDownIfBound()
        const bind = shouldBind === undefined ? true : (toValue(shouldBind) as boolean)
        if (!bind) {
          return
        }
        runContainerPanelsWatchEffect(
          isMounted,
          containerRef.value,
          panelsContainerRef.value,
          mountRest,
          (panelsEl) => {
            if (panelsEl) {
              lastBoundPanelsEl = panelsEl
            }
          }
        )
      },
      { immediate: true, flush: 'post' }
    )
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    tearDownIfBound()
    watcherStop.value?.()
  })

  onUnmounted(() => {
    containerRef.value = undefined
    panelsContainerRef.value = undefined
  })

  return {
    isMounted,
  }
}
