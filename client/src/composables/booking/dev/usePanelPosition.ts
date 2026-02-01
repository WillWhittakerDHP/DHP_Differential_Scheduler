/**
 * usePanelPosition Composable
 * 
 * LEARNING: Extracts panel positioning logic from CalendarMockDevPanel component
 * WHY: Moves DOM manipulation logic out of component into reusable composable
 * PATTERN: Composable that handles panel positioning calculations and updates
 * 
 * Features:
 * - Calculates panel position to prevent overflow
 * - Handles window resize events
 * - Manages transform transitions
 */

import { ref, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export interface UsePanelPositionOptions {
  wrapperRef: Ref<HTMLElement | null>
  
  panelRef: Ref<HTMLElement | null>
  
  isExpanded: Ref<boolean>
  
  expectedPanelWidth?: number
}

export interface UsePanelPositionReturn {
  panelTransform: Ref<string>
  
  isTransitioning: Ref<boolean>
  
  calculatePanelPosition: () => string
  
  updatePanelPosition: () => void
  
  handleToggle: (willExpand: boolean) => Promise<void>
}

/**
 * LEARNING: Panel positioning composable
 * WHY: Extracts DOM manipulation logic from component to composable
 * PATTERN: Composable that handles all panel positioning concerns
 */
export function usePanelPosition(
  options: UsePanelPositionOptions
): UsePanelPositionReturn {
  const {
    wrapperRef,
    panelRef,
    isExpanded,
    expectedPanelWidth = 400
  } = options

  const panelTransform = ref('translateX(0)')
  const isTransitioning = ref(false)

  /**
   * LEARNING: Calculate transform using expected panel dimensions
   * WHY: Panel should be positioned correctly from the start of expansion
   * PATTERN: Calculate using expected width before DOM update
   */
  const calculatePanelPosition = (): string => {
    if (!wrapperRef.value) {
      return 'translateX(0)'
    }

    const wrapperRect = wrapperRef.value.getBoundingClientRect()
    const panelWidth = expectedPanelWidth
    const viewportWidth = window.innerWidth
    const rightEdge = wrapperRect.right + panelWidth
    const padding = 24 // Viewport padding

    // PATTERN: Calculate transform to shift left if needed
    if (rightEdge > viewportWidth - padding) {
      const overflow = rightEdge - (viewportWidth - padding)
      return `translateX(-${overflow}px)`
    }
    return 'translateX(0)'
  }

  /**
   * LEARNING: Refine position after DOM update for accurate measurements
   * WHY: Initial calculation uses expected width, this refines with actual width
   * PATTERN: Use requestAnimationFrame for accurate measurements after expansion
   */
  const updatePanelPosition = (): void => {
    if (!isExpanded.value || !panelRef.value || !wrapperRef.value) {
      return
    }

    // PATTERN: Use requestAnimationFrame for accurate measurements
    requestAnimationFrame(() => {
      if (!panelRef.value || !wrapperRef.value || !isExpanded.value) return

      const wrapperRect = wrapperRef.value.getBoundingClientRect()
      const panelWidth = panelRef.value.offsetWidth || expectedPanelWidth
      const viewportWidth = window.innerWidth
      const rightEdge = wrapperRect.right + panelWidth
      const padding = 24 // Viewport padding

      // PATTERN: Calculate transform to shift left if needed
      if (rightEdge > viewportWidth - padding) {
        const overflow = rightEdge - (viewportWidth - padding)
        panelTransform.value = `translateX(-${overflow}px)`
      } else {
        panelTransform.value = 'translateX(0)'
      }
    })
  }

  /**
   * LEARNING: Handle resize events
   * WHY: Recalculate position when window resizes
   * PATTERN: Event handler that calls updatePanelPosition
   */
  const handleResize = (): void => {
    if (isExpanded.value) {
      updatePanelPosition()
    }
  }

  // PATTERN: Watch isExpanded and update position
  watch(isExpanded, (newValue) => {
    if (newValue) {
      updatePanelPosition()
    }
  })

  // PATTERN: Add listener on mount, remove on unmount
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  /**
   * LEARNING: Handle expansion toggle click
   * WHY: Calculates transform before state change to prevent visual hop
   * PATTERN: Calculate transform synchronously, apply it, then toggle state
   */
  const handleToggle = async (willExpand: boolean): Promise<void> => {
    if (willExpand) {
      // LEARNING: Calculate transform BEFORE toggling expansion state
      // PATTERN: Calculate synchronously, disable transitions, apply transform, then toggle state
      const calculatedTransform = calculatePanelPosition()
      
      isTransitioning.value = true
      
      // PATTERN: Set transform value synchronously
      panelTransform.value = calculatedTransform
      
      // PATTERN: Use nextTick to ensure DOM update happens before state change
      await nextTick()
      
      // LEARNING: Expansion state is managed by component
      // WHY: Component controls isExpanded, composable only handles positioning
      // PATTERN: Component will set isExpanded.value = true after calling this
      
      // PATTERN: Use nextTick then requestAnimationFrame for precise timing
      nextTick(() => {
        requestAnimationFrame(() => {
          isTransitioning.value = false
          
          // PATTERN: Use requestAnimationFrame for accurate measurements
          updatePanelPosition()
        })
      })
      
      // PATTERN: Use setTimeout to wait for VExpandTransition (300ms)
      setTimeout(() => {
        updatePanelPosition()
      }, 350)
    } else {
      // LEARNING: Collapse panel - component manages isExpanded state
      // WHY: Component controls isExpanded, composable only handles positioning
      // PATTERN: Keep transform during collapse, reset after animation completes
      // PATTERN: Wait for collapse transition (300ms) before resetting transform
      setTimeout(() => {
        panelTransform.value = 'translateX(0)'
        isTransitioning.value = false
      }, 350)
    }
  }

  return {
    panelTransform,
    isTransitioning,
    calculatePanelPosition,
    updatePanelPosition,
    handleToggle
  }
}
