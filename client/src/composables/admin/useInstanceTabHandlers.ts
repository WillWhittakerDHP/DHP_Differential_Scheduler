/**
 * Composable for instance tab click handlers
 */

import type { Ref } from 'vue'

export interface UseInstanceTabHandlersOptions {
  activeTab: Ref<string>
}

export interface UseInstanceTabHandlersReturn {
  handleTabClick: (tabValue: string) => void
}

/**
 * PATTERN: Composable for handling tab clicks
PATTERN: Set activeTab to clicked tab...
 */
export function useInstanceTabHandlers(
  options: UseInstanceTabHandlersOptions
): UseInstanceTabHandlersReturn {
  const { activeTab } = options

  /**
Handle tab click to switch active tab
PATTERN: Set activeTab to clic...
   */
  const handleTabClick = (tabValue: string): void => {
    activeTab.value = tabValue
  }

  return {
    handleTabClick
  }
}
