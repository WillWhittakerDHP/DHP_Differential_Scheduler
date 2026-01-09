/**
 * Responsive Grid Composable
 * 
 * LEARNING: Extracts responsive grid calculation logic from components
 * WHY: Components should be thin UI wrappers - layout calculations belong in composables
 * PATTERN: Composable that handles ResizeObserver and column calculations
 * 
 * This composable handles:
 * - ResizeObserver setup and cleanup
 * - Dynamic column calculation based on container width
 * - Single-column mode detection
 */

import { ref, computed, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

/**
 * Responsive Grid Composable Options
 */
export interface UseResponsiveGridOptions {
  /**
   * LEARNING: Reference to grid container element
   * WHY: Needed to observe width changes
   * PATTERN: Template ref to HTMLElement
   */
  gridRef: Ref<HTMLElement | null>
  
  /**
   * LEARNING: Minimum number of columns
   * WHY: Prevents grid from having too few columns
   * PATTERN: Number, defaults to 2
   */
  minColumns?: number
  
  /**
   * LEARNING: Maximum number of columns
   * WHY: Prevents grid from having too many columns
   * PATTERN: Number, defaults to 8
   */
  maxColumns?: number
  
  /**
   * LEARNING: Minimum width for each button/item
   * WHY: Ensures items have adequate size
   * PATTERN: Number in pixels, defaults to 80
   */
  buttonMinWidth?: number
  
  /**
   * LEARNING: Gap between grid items
   * WHY: Spacing between grid items
   * PATTERN: Number in pixels, defaults to 10
   */
  gap?: number
  
  /**
   * LEARNING: Horizontal padding of container
   * WHY: Accounts for container padding in width calculations
   * PATTERN: Number in pixels, defaults to 32 (16px each side)
   */
  padding?: number
}

/**
 * Responsive Grid Composable Return Type
 */
export interface UseResponsiveGridReturn {
  /**
   * LEARNING: Current container width
   * WHY: Used for column calculations
   * PATTERN: Ref number updated by ResizeObserver
   */
  containerWidth: Ref<number>
  
  /**
   * LEARNING: Calculated number of columns
   * WHY: Component needs column count for grid layout
   * PATTERN: Computed property that calculates columns from width
   */
  buttonGridColumns: Ref<number>
  
  /**
   * LEARNING: Whether grid is in single-column mode
   * WHY: Component needs to apply single-column CSS class
   * PATTERN: Computed property that checks if columns === 1
   */
  isSingleColumn: Ref<boolean>
}

/**
 * Responsive Grid Composable
 * 
 * LEARNING: Provides responsive grid calculation logic extracted from components
 * WHY: Moves layout calculations out of components into reusable composable
 * PATTERN: Composable with ResizeObserver and computed column calculations
 */
export function useResponsiveGrid(
  options: UseResponsiveGridOptions
): UseResponsiveGridReturn {
  const {
    gridRef,
    minColumns = 2,
    maxColumns = 8,
    buttonMinWidth = 80,
    gap = 10,
    padding = 32
  } = options
  
  /**
   * LEARNING: Current container width
   * WHY: Used for column calculations
   * PATTERN: Ref number updated by ResizeObserver
   */
  const containerWidth = ref<number>(0)
  
  /**
   * LEARNING: ResizeObserver reference for cleanup
   * WHY: Need to disconnect observer on unmount
   * PATTERN: Store observer reference outside setup
   */
  let resizeObserver: ResizeObserver | null = null
  
  /**
   * LEARNING: Computed property for dynamic button grid columns
   * WHY: Calculates optimal column count based on available width
   * PATTERN: Computed that calculates columns from width, button size, gap, and padding
   * NOTE: No longer returns 1 for small widths - single-column mode is handled separately via viewport check
   */
  const buttonGridColumns = computed(() => {
    // Return minimum columns if container width is not yet measured
    if (containerWidth.value === 0) {
      return minColumns
    }
    
    const calculatedColumns = Math.floor((containerWidth.value - padding) / (buttonMinWidth + gap))
    
    // Clamp to min/max range (no single-column fallback here)
    return Math.max(
      minColumns,
      Math.min(
        maxColumns,
        calculatedColumns
      )
    )
  })
  
  /**
   * LEARNING: Computed property to detect single-column mode
   * WHY: Enables conditional CSS class for vertical scrolling only on mobile screens
   * PATTERN: Checks viewport width and column count to determine if single-column mode should be used
   */
  const isSingleColumn = computed(() => {
    // Only use single-column mode if viewport is mobile-sized
    // This enables vertical scrolling only on small screens
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 600
    return isMobileViewport && buttonGridColumns.value <= 2
  })
  
  /**
   * LEARNING: Set up ResizeObserver to track grid container width
   * WHY: Enables responsive button grid that adapts to available space
   * PATTERN: Create ResizeObserver, observe element, cleanup on unmount
   * NOTE: Use nextTick to ensure ref is available after DOM is mounted
   */
  onMounted(async () => {
    await nextTick()
    if (gridRef.value) {
      // LEARNING: Initial width measurement as fallback
      // WHY: ResizeObserver might not fire immediately, so get initial width
      // PATTERN: Use getBoundingClientRect() for initial measurement
      const initialWidth = gridRef.value.getBoundingClientRect().width
      if (initialWidth > 0) {
        containerWidth.value = initialWidth
      }
      
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerWidth.value = entry.contentRect.width
        }
      })
      resizeObserver.observe(gridRef.value)
      
      // LEARNING: Additional check after a short delay
      // WHY: Parent container might not be fully laid out yet
      // PATTERN: Use setTimeout to check width again after layout
      setTimeout(() => {
        if (gridRef.value) {
          const delayedWidth = gridRef.value.getBoundingClientRect().width
          if (delayedWidth > 0 && delayedWidth !== containerWidth.value) {
            containerWidth.value = delayedWidth
          }
        }
      }, 100)
    }
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
    containerWidth,
    buttonGridColumns,
    isSingleColumn
  }
}





