/**
 * PATTERN: Composable for tab navigation state management
PATTERN: Simple composabl...
 */
import { ref } from 'vue'
import type { UseTabNavigationOptions, UseTabNavigationReturn } from '@/types/admin/tabNavigation'


/**
 * WHY: Composable for managing tab navigation state
WHY: Centralizes tab state ...
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
