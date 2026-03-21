/**
 * PATTERN: Dev Panel Tabs Composable

PATTERN: Simple state management composable
 */
import { ref, watch } from 'vue'
import type { DevPanelTab, UseDevPanelTabsReturn } from '@/types/dev/devPanelTabs'


/**
 * Composable for managing dev panel tabs
 *
 * @param onTabChange - Optional callback when tab changes
 * @returns Tab state and management functions
 */
export function useDevPanelTabs(onTabChange?: (tab: DevPanelTab) => void): UseDevPanelTabsReturn {
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
