/**
 * WHY: Element Dimensions Composable — uses getContentWidth from utils/dom for measurement (no direct window.getComputedStyle in composable).
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getContentWidth } from '@/utils/dom/elementMeasure'
import type { UseElementDimensionsOptions, UseElementDimensionsReturn } from '@/types/booking/elementDimensions'


/**
 * WHY: Element Dimensions Composable

WHY: Isolates DOM access for better testa...
 */
export function useElementDimensions(
  options: UseElementDimensionsOptions
): UseElementDimensionsReturn {
  const { elementRef } = options

  const contentWidth = ref<number>(0)

  let resizeObserver: ResizeObserver | null = null

  const measureWidth = (): void => {
    if (!elementRef.value) return
    const measuredWidth = getContentWidth(elementRef.value)
    if (measuredWidth > 0) {
      contentWidth.value = measuredWidth
    }
  }

  onMounted(async () => {
    // PATTERN: Check typeof window before accessing ResizeObserver
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return
    }

    await nextTick()

    // PATTERN: Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureWidth()

        if (elementRef.value) {
          resizeObserver = new ResizeObserver(() => {
            if (!elementRef.value) return
            const newWidth = getContentWidth(elementRef.value)
            if (newWidth > 0) {
              contentWidth.value = newWidth
            }
          })
          resizeObserver.observe(elementRef.value)

          setTimeout(() => {
            measureWidth()
          }, 200)
        }
      })
    })
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })

  return {
    contentWidth,
  }
}
