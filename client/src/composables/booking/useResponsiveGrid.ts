/**
 * WHY: Responsive Grid Composable

WHY: Components should be thin UI wrappers -...
 */
import { computed, type Ref } from 'vue'
import { useElementDimensions } from './useElementDimensions'

export interface UseResponsiveGridOptions {
  /**
   */
  gridRef: Ref<HTMLElement | null>
  
  /**
   */
  minColumns?: number
  
  /**
   */
  maxColumns?: number
  
  /**
   */
  buttonMinWidth?: number
  
  /**
   */
  gap?: number
  
  /**
   */
  padding?: number
}

export interface UseResponsiveGridReturn {
  /**
   */
  containerWidth: Ref<number>
  
  /**
   */
  buttonGridColumns: Ref<number>
  
  /**
   */
  isSingleColumn: Ref<boolean>
}

/**
 * WHY: Responsive Grid Composable

WHY: Moves layout calculations out of compon...
 */
export function useResponsiveGrid(
  options: UseResponsiveGridOptions
): UseResponsiveGridReturn {
  const {
    gridRef,
    maxColumns = 8,
    buttonMinWidth = 80,
    gap = 10,
  } = options
  
  /**
   * WHY: /**
LEARNING: Use element dimensions composable for DOM access isolation...
   */
  const { contentWidth: containerWidth } = useElementDimensions({
    elementRef: gridRef,
  })
  
  /**
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





