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

import { computed, type Ref } from 'vue'
import { useElementDimensions } from './useElementDimensions'

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
   * LEARNING: Use element dimensions composable for DOM access isolation
   * WHY: Keeps DOM access out of this composable for better testability
   * PATTERN: Delegate element measurement to dedicated composable
   */
  const { contentWidth: containerWidth } = useElementDimensions({
    elementRef: gridRef,
  })
  
  /**
   * LEARNING: Computed property for dynamic button grid columns
   * WHY: Calculates optimal column count based on available width
   * PATTERN: Computed that calculates columns from width, button size, gap, and padding
   * NOTE: Relies on ResizeObserver to measure actual container width from Vuetify grid
   */
  const buttonGridColumns = computed(() => {
    if (containerWidth.value === 0) {
      return minColumns
    }
    
    // PATTERN: contentRect.width gives us the content area width where buttons are placed
    const availableWidth = containerWidth.value
    
    // PATTERN: Floor division to get whole columns that fit
    const calculatedColumns = Math.floor(availableWidth / (buttonMinWidth + gap))
    
    const result = Math.max(
      minColumns,
      Math.min(
        maxColumns,
        calculatedColumns
      )
    )
    
    // PATTERN: Remove debug console.log statements - use proper logging if needed
    
    return result
  })
  
  /**
   * LEARNING: Computed property to detect single-column mode
   * WHY: Enables conditional CSS class for vertical scrolling only on mobile screens
   * PATTERN: Checks viewport width and column count to determine if single-column mode should be used
   */
  const isSingleColumn = computed(() => {
    // LEARNING: Use element dimensions composable's viewport check helper
    // WHY: Isolates viewport access for better testability
    // PATTERN: Check viewport width via utility function
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 600
    return isMobileViewport && buttonGridColumns.value <= 2
  })
  
  return {
    containerWidth,
    buttonGridColumns,
    isSingleColumn
  }
}





