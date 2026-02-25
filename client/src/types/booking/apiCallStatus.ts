export type ApiCallStatus = 'hit' | 'error' | 'not_called'

export interface ApiCallStatusState {
  events: ApiCallStatus
  routes: ApiCallStatus
  places: ApiCallStatus
  computedData: ApiCallStatus
}

import type { Ref } from 'vue'

export interface UseApiCallStatusReturn {
  apiStatus: Ref<ApiCallStatusState>
  recordApiCall: (api: 'events' | 'routes' | 'places' | 'computedData', status: 'hit' | 'error') => void
  resetApiStatus: () => void
}
