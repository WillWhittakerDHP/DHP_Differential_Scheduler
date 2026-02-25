import type { Ref } from 'vue'

export interface UseMockCalendarRefreshReturn {
  mockRefreshKey: Ref<number>
  resetMocks: () => void
}
