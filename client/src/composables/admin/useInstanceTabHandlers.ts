/**
 * Composable for instance tab click handlers
 */
import type { UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn } from '@/types/admin/instanceTabHandlers'

export type { UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn } from '@/types/admin/instanceTabHandlers'

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
