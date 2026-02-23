/**
 * PATTERN: Dev Panel Tabs Composable

PATTERN: Simple state management composable
 */
import { ref, watch } from 'vue'

export type DevPanelTab = 'status' | 'drivetime' | 'computed'

/**
 * Composable for managing dev panel tabs
 * 
 * @param onTabChange - Optional callback when tab changes
 * @returns Tab state and management functions
 */
export function useDevPanelTabs(onTabChange?: (tab: DevPanelTab) => void) {
  const activeTab = ref<DevPanelTab>('status')

  watch(activeTab, (newTab) => {
    if (onTabChange) {
      onTabChange(newTab)
    }
  })

  return {
    activeTab,
  }
}
