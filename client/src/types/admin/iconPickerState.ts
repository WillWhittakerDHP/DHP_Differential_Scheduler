import type { Ref } from 'vue'

export interface UseIconPickerStateOptions {
  dialogOpen: Ref<boolean>
  currentIcon?: Ref<string | null> | string | null
}

export interface UseIconPickerStateReturn {
  selectedIcon: Ref<string | null>
  searchTerm: Ref<string>
  resetState: () => void
}
