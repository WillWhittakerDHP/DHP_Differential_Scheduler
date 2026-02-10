/**
 * Dev Panel Tabs Composable
 * 
 * LEARNING: Manages tab state and switching logic for dev panels
 * WHY: Reduces component complexity, enables reuse
 * PATTERN: Simple state management composable
 */

import { ref, watch } from 'vue'

export type DevPanelTab = 'status' | 'drivetime' | 'computed'

/**
 * Composable for managing dev panel tabs
 * LEARNING: Extracted tab management logic
 * WHY: Reduces main component complexity
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
