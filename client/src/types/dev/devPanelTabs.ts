import type { Ref } from 'vue'

export type DevPanelTab = 'status' | 'drivetime' | 'computed'

export interface UseDevPanelTabsReturn {
  activeTab: Ref<DevPanelTab>
}
