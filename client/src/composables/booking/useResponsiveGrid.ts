import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useElementDimensions } from './useElementDimensions'
import type { UseResponsiveGridOptions, UseResponsiveGridReturn } from '@/types/booking/responsiveGrid'


export function useResponsiveGrid(
  options: UseResponsiveGridOptions
): UseResponsiveGridReturn {
  const {
    gridRef,
    minColumns = 1,
    maxColumns = 8,
    buttonMinWidth = 80,
    gap = 10,
    padding: _padding = 20,
  } = options
  
  const { contentWidth: containerWidth } = useElementDimensions({
    elementRef: gridRef,
  })
  
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
  
  const display = useDisplay()
  const isSingleColumn = computed(() => {
    const isMobileViewport = display.mobile.value || display.width.value < 600
    return isMobileViewport && buttonGridColumns.value <= 2
  })
  
  return {
    containerWidth,
    buttonGridColumns,
    isSingleColumn
  }
}





