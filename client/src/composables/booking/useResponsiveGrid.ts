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
    minColumns = 1, // LEARNING: Default to 1 column minimum to allow single-column layout when space is tight
    maxColumns = 8,
    buttonMinWidth = 80,
    gap = 10,
    padding: _padding = 20 // LEARNING: Match actual CSS padding (10px each side = 20px total) - unused, padding calculated from computed styles
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
   * NOTE: Relies on ResizeObserver to measure actual container width from Vuetify grid
   */
  const buttonGridColumns = computed(() => {
    // Return minimum columns if container width is not yet measured
    if (containerWidth.value === 0) {
      return minColumns
    }
    
    // LEARNING: Calculate available width for buttons
    // WHY: containerWidth.value is already contentRect.width (excludes padding), so use it directly
    // PATTERN: contentRect.width gives us the content area width where buttons are placed
    const availableWidth = containerWidth.value
    
    // LEARNING: Calculate how many columns fit
    // WHY: Each column needs buttonMinWidth + gap space
    // PATTERN: Floor division to get whole columns that fit
    const calculatedColumns = Math.floor(availableWidth / (buttonMinWidth + gap))
    
    // LEARNING: Ensure at least minColumns, at most maxColumns
    // WHY: Respect min/max constraints while using calculated value
    const result = Math.max(
      minColumns,
      Math.min(
        maxColumns,
        calculatedColumns
      )
    )
    
    // LEARNING: Debug logging removed
    // WHY: Debug logging should use proper logger utility, not console.log
    // PATTERN: Remove debug console.log statements - use proper logging if needed
    
    return result
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
    
    // LEARNING: Wait for layout to complete before measuring
    // WHY: Element might not be fully laid out immediately after mount
    // PATTERN: Use requestAnimationFrame to ensure layout is complete
    const measureWidth = () => {
      if (!gridRef.value) return
      
      // LEARNING: Use getBoundingClientRect for initial measurement
      // WHY: Need content width (excluding padding) to match contentRect behavior
      // PATTERN: Get element width and subtract padding to get content area width
      const rect = gridRef.value.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(gridRef.value)
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0
      const measuredWidth = rect.width - paddingLeft - paddingRight // Content width excluding padding
      
      // Only update if we get a valid width (greater than 0)
      if (measuredWidth > 0) {
        containerWidth.value = measuredWidth
      }
    }
    
    // Measure after layout completes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureWidth()
        
        if (gridRef.value) {
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              // LEARNING: Use borderBoxSize for total element width, then subtract padding
              // WHY: borderBoxSize gives us the full element width including padding
              // PATTERN: Get total width and subtract padding to get content area width
              const borderBoxWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
              const computedStyle = window.getComputedStyle(gridRef.value!)
              const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
              const paddingRight = parseFloat(computedStyle.paddingRight) || 0
              const newWidth = borderBoxWidth - paddingLeft - paddingRight
              
              // LEARNING: Debug logging removed
              // WHY: Debug logging should use proper logger utility, not console.log
              // PATTERN: Remove debug console.log statements - use proper logging if needed
              
              // Only update if width is valid (greater than 0)
              if (newWidth > 0) {
                containerWidth.value = newWidth
              }
            }
          })
          resizeObserver.observe(gridRef.value)
          
          // LEARNING: Additional check after a delay to catch late layout changes
          // WHY: Some layouts take multiple frames to settle
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
    containerWidth,
    buttonGridColumns,
    isSingleColumn
  }
}





