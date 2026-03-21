import type { Ref } from 'vue'

export interface UseTabNavigationOptions {
  initialTab?: string
}

export interface UseTabNavigationReturn {
  currentTab: Ref<string>
  navigateToTab: (tab: string) => void
}
