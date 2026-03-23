/**
 * WHY: Element Dimensions Composable — uses getContentWidth from utils/dom for measurement (no direct window.getComputedStyle in composable).
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  isBrowserResizeObserverSupported,
  startContentWidthTracking,
} from '@/utils/dom/elementWidthTracking'
import type { UseElementDimensionsOptions, UseElementDimensionsReturn } from '@/types/booking/elementDimensions'

export function useElementDimensions(options: UseElementDimensionsOptions): UseElementDimensionsReturn {
  const { elementRef } = options

  const contentWidth = ref<number>(0)
  let stopTracking: (() => void) | null = null

  onMounted(async () => {
    if (!isBrowserResizeObserverSupported()) {
      return
    }
    await nextTick()
    stopTracking = startContentWidthTracking(
      () => elementRef.value,
      (w) => {
        contentWidth.value = w
      },
      { lateRemeasureMs: 200 }
    )
  })

  onUnmounted(() => {
    stopTracking?.()
    stopTracking = null
  })

  return {
    contentWidth,
  }
}
