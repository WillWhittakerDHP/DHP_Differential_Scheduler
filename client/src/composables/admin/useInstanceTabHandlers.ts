/**
 * Composable for instance tab click handlers
 * WHY: Extracts tab click handler logic from InstancesTab
 * PATTERN: Simple handler function
 */

import type { Ref } from 'vue'

export interface UseInstanceTabHandlersOptions {
  activeTab: Ref<string>
}

export interface UseInstanceTabHandlersReturn {
  handleTabClick: (tabValue: string) => void
}

/**
 * Composable for handling tab clicks
 * WHY: Switches between BlockShape tabs and Shapes tab, always keeping a tab active
 * PATTERN: Set activeTab to clicked tab value, never allow empty state
 */
export function useInstanceTabHandlers(
  options: UseInstanceTabHandlersOptions
): UseInstanceTabHandlersReturn {
  const { activeTab } = options

  /**
   * Handle tab click to switch active tab
   * WHY: Switches between BlockShape tabs and Shapes tab, always keeping a tab active
   * PATTERN: Set activeTab to clicked tab value (blockShapeId or 'shapes'), never allow empty state
   * FIX: Removed collapse behavior that set activeTab to '' which caused VWindow to have no matching content
   * WHY FIX: When activeTab is empty string, VWindow can't find matching VWindowItem (all have blockShape.id values or 'shapes'),
   *          causing content to disappear and potentially causing layout/scrolling issues
   */
  const handleTabClick = (tabValue: string): void => {
    // Always set to clicked tab - don't allow collapse to empty string
    // Empty string causes VWindow to have no matching VWindowItem, breaking the UI
    activeTab.value = tabValue
  }

  return {
    handleTabClick
  }
}
