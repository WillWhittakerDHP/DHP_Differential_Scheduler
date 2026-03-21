import type { Ref, ComputedRef } from 'vue'

export interface UseEntityCardExpansionOptions {
  expanded: Ref<boolean> | boolean
}

export interface UseEntityCardExpansionReturn {
  isExpanded: ComputedRef<boolean>
  handleExpansionChange: (event: { value: boolean }) => void
}
