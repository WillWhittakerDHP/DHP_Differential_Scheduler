/**
 * useApiCallStatus Composable
 * 
 * LEARNING: Tracks API call status for dev panel debugging
 * WHY: Provides visibility into which APIs have been called and their results
 * PATTERN: Shared state composable with persistent refs
 */

import { ref } from 'vue'

export type ApiCallStatus = 'hit' | 'error' | 'not_called'

export interface ApiCallStatusState {
  events: ApiCallStatus
  routes: ApiCallStatus
  places: ApiCallStatus
  computedData: ApiCallStatus
}

// Shared state - persists across component instances
const sharedApiStatus = ref<ApiCallStatusState>({
  events: 'not_called',
  routes: 'not_called',
  places: 'not_called',
  computedData: 'not_called',
})

/**
 * useApiCallStatus composable
 * 
 * LEARNING: Provides shared state for API call status tracking
 * WHY: Multiple components need consistent API status visibility
 * PATTERN: Composable with shared module-level state
 */
export function useApiCallStatus() {
  /**
   * Record an API call result
   */
  const recordApiCall = (api: 'events' | 'routes' | 'places' | 'computedData', status: 'hit' | 'error'): void => {
    sharedApiStatus.value[api] = status
  }

  /**
   * Reset API status (for testing/debugging)
   */
  const resetApiStatus = (): void => {
    sharedApiStatus.value = {
      events: 'not_called',
      routes: 'not_called',
      places: 'not_called',
      computedData: 'not_called',
    }
  }

  return {
    apiStatus: sharedApiStatus,
    recordApiCall,
    resetApiStatus
  }
}
