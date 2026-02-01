/**
 * useMockCalendarRefresh Composable
 * 
 * LEARNING: Manages mock calendar refresh key and reset functionality
 * WHY: Extracts mock calendar refresh management from AvailabilityStep component
 * PATTERN: Composable that manages refresh state and watches parent signal
 */

import { ref, watch, inject, type Ref } from 'vue'

export interface UseMockCalendarRefreshReturn {
  mockRefreshKey: Ref<number>
  
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
  // PATTERN: Incrementing ref forces computed properties to recalculate
  const mockRefreshKey = ref(0)

  // PATTERN: Increment refresh key to force recalculation in computed properties
  const resetMocks = (): void => {
    mockRefreshKey.value++
  }

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
