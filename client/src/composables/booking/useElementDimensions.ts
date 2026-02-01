/**
 * Element Dimensions Composable
 * 
 * LEARNING: Isolates DOM access for element dimension measurements
 * WHY: Keeps DOM access out of composables for better testability
 * PATTERN: Composable that handles ResizeObserver setup, element measurement, cleanup
 * 
 * This composable handles:
 * - ResizeObserver setup and cleanup
 * - Element width measurement (content width excluding padding)
 * - SSR safety checks
 */

import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export interface UseElementDimensionsOptions {
  /**
   * LEARNING: Reference to element to measure
   * WHY: Needed to observe width changes
   * PATTERN: Template ref to HTMLElement
   */
  elementRef: Ref<HTMLElement | null>
}

export interface UseElementDimensionsReturn {
  /**
   * LEARNING: Current element content width (excluding padding)
   * WHY: Used for responsive calculations
   * PATTERN: Ref number updated by ResizeObserver
   */
  contentWidth: Ref<number>
}

/**
 * Element Dimensions Composable
 * 
 * LEARNING: Provides element dimension measurement with ResizeObserver
 * WHY: Isolates DOM access for better testability
 * PATTERN: Composable with ResizeObserver setup and cleanup
 */
export function useElementDimensions(
  options: UseElementDimensionsOptions
): UseElementDimensionsReturn {
  const { elementRef } = options

  /**
   * LEARNING: Current element content width (excluding padding)
   * WHY: Used for responsive calculations
   * PATTERN: Ref number updated by ResizeObserver
   */
  const contentWidth = ref<number>(0)

  /**
   * LEARNING: ResizeObserver reference for cleanup
   * WHY: Need to disconnect observer on unmount
   * PATTERN: Store observer reference outside setup
   */
  let resizeObserver: ResizeObserver | null = null

  /**
   * LEARNING: Measure element content width (excluding padding)
   * WHY: Need content area width for responsive calculations
   * PATTERN: Get element width and subtract padding to get content area width
   */
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

  /**
   * LEARNING: Set up ResizeObserver to track element width
   * WHY: Enables responsive calculations that adapt to available space
   * PATTERN: Create ResizeObserver, observe element, cleanup on unmount
   * NOTE: Use nextTick to ensure ref is available after DOM is mounted
   */
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

  /**
   * LEARNING: Cleanup ResizeObserver
   * WHY: Prevents memory leaks when component unmounts
   * PATTERN: Disconnect observer if it exists
   */
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
