/**
 * PATTERN: useApiCallStatus Composable

PATTERN: Shared state composable with persi...
 */
import { ref } from 'vue'

export type ApiCallStatus = 'hit' | 'error' | 'not_called'

export interface ApiCallStatusState {
  events: ApiCallStatus
  routes: ApiCallStatus
  places: ApiCallStatus
  computedData: ApiCallStatus
}

const sharedApiStatus = ref<ApiCallStatusState>({
  events: 'not_called',
  routes: 'not_called',
  places: 'not_called',
  computedData: 'not_called',
})

/**
 * PATTERN: useApiCallStatus composable

PATTERN: Composable with shared module-leve...
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
