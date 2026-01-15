/**
 * Composable for tab navigation state management
 * WHY: Extracts tab navigation logic from components
 * PATTERN: Simple composable that manages tab state
 */

import { ref, type Ref } from 'vue'

export interface UseTabNavigationOptions {
  initialTab?: string
}

export interface UseTabNavigationReturn {
  currentTab: Ref<string>
  navigateToTab: (tab: string) => void
}

/**
 * Composable for managing tab navigation state
 * WHY: Centralizes tab state management logic
 * PATTERN: Returns reactive tab state and navigation function
 */
export function useTabNavigation(options: UseTabNavigationOptions = {}): UseTabNavigationReturn {
  const { initialTab = '' } = options
  
  const currentTab = ref<string>(initialTab)
  
  const navigateToTab = (tab: string): void => {
    currentTab.value = tab
  }
  
  return {
    currentTab,
    navigateToTab
  }
}
