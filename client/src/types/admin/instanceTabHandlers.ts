import type { Ref } from 'vue'

export interface UseInstanceTabHandlersOptions {
  activeTab: Ref<string>
}

export interface UseInstanceTabHandlersReturn {
  handleTabClick: (tabValue: string) => void
}
