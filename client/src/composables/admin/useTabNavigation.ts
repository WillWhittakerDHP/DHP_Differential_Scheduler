/**
 * PATTERN: Composable for tab navigation state management
PATTERN: Simple composabl...
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
