/**
 * useMockCalendarRefresh Composable
 * 
 * LEARNING: Manages mock calendar refresh key and reset functionality
 * WHY: Extracts mock calendar refresh management from AvailabilityStep component
 * PATTERN: Composable that manages refresh state and watches parent signal
 */

import { ref, watch, inject, type Ref } from 'vue'

/**
 * useMockCalendarRefresh composable return type
 */
export interface UseMockCalendarRefreshReturn {
  /**
   * Refresh key for forcing mock calendar data regeneration
   * LEARNING: Incrementing ref forces computed properties to recalculate
   * WHY: Allows users to reset mock data without changing date range
   */
  mockRefreshKey: Ref<number>
  
  /**
   * Reset mock calendar data
   * LEARNING: Increments refresh key to force recalculation
   * WHY: Allows developers to regenerate mock busy periods for testing
   */
  resetMocks: () => void
}

/**
 * useMockCalendarRefresh composable
 * 
 * LEARNING: Manages mock calendar refresh key and reset functionality
 * WHY: Extracts refresh management logic from component to composable
 * PATTERN: Composable that manages state and watches parent signal
 */
export function useMockCalendarRefresh(): UseMockCalendarRefreshReturn {
  // LEARNING: Refresh key for forcing mock calendar data regeneration
  // WHY: Allows users to reset mock data without changing date range
  // PATTERN: Incrementing ref forces computed properties to recalculate
  const mockRefreshKey = ref(0)

  // LEARNING: Reset mock calendar data
  // WHY: Allows developers to regenerate mock busy periods for testing
  // PATTERN: Increment refresh key to force recalculation in computed properties
  const resetMocks = (): void => {
    mockRefreshKey.value++
  }

  // LEARNING: Inject reset mocks signal from BookingWizard
  // WHY: Allows BookingWizard to trigger mock reset from RESET MOCKS button
  // PATTERN: Watch signal ref and call resetMocks when it changes
  const resetMocksSignal = inject<Ref<number>>('resetMocksSignal', ref(0))
  watch(resetMocksSignal, () => {
    resetMocks()
  })

  return {
    mockRefreshKey,
    resetMocks
  }
}
