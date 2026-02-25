/**
 * PATTERN: useMockCalendarRefresh Composable

PATTERN: Composable that manages refr...
 */
import { ref, watch, inject } from 'vue'
import type { UseMockCalendarRefreshReturn } from '@/types/booking/mockCalendarRefresh'

export type { UseMockCalendarRefreshReturn } from '@/types/booking/mockCalendarRefresh'

/**
 * WHY: useMockCalendarRefresh composable

WHY: Extracts refresh management logi...
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
