/**
 * WHY: Element Dimensions Composable

LEARNING: Isolates DOM access for element...
 */
import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export interface UseElementDimensionsOptions {
  elementRef: Ref<HTMLElement | null>
}

export interface UseElementDimensionsReturn {
  contentWidth: Ref<number>
}

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
    // PATTERN: Check typeof window before accessing it
    if (typeof window === 'undefined') {
      return
    }

    if (!elementRef.value) {
      return
    }

    // PATTERN: Get element width and subtract padding to get content area width
    const rect = elementRef.value.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(elementRef.value)
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0
    const measuredWidth = rect.width - paddingLeft - paddingRight // Content width excluding padding

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
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (!elementRef.value) {
                return
              }

              // PATTERN: Get total width and subtract padding to get content area width
              const borderBoxWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
              const computedStyle = window.getComputedStyle(elementRef.value)
              const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
              const paddingRight = parseFloat(computedStyle.paddingRight) || 0
              const newWidth = borderBoxWidth - paddingLeft - paddingRight

              if (newWidth > 0) {
                contentWidth.value = newWidth
              }
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
