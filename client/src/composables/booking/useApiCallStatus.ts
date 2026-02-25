/**
 * PATTERN: useApiCallStatus Composable

PATTERN: Shared state composable with persi...
 */
import { ref } from 'vue'
import type { ApiCallStatusState, UseApiCallStatusReturn } from '@/types/booking/apiCallStatus'

export type { ApiCallStatusState, UseApiCallStatusReturn } from '@/types/booking/apiCallStatus'

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
export function useApiCallStatus(): UseApiCallStatusReturn {
  const recordApiCall = (api: 'events' | 'routes' | 'places' | 'computedData', status: 'hit' | 'error'): void => {
    sharedApiStatus.value[api] = status
  }

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
