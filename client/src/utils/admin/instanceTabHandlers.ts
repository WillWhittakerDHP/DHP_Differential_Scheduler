/**
 * Handler factory for instance tab clicks. Accepts reactive state, no Vue reactivity used internally.
 */
import type { UseInstanceTabHandlersOptions, UseInstanceTabHandlersReturn } from '@/types/admin/instanceTabHandlers'


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
