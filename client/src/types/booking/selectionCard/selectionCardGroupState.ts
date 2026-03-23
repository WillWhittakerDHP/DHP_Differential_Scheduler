import type { Ref, ComputedRef } from 'vue'
import type { SelectionCardConfig, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

export interface UseSelectionCardGroupStateParams {
  items: ComputedRef<SelectionCardItem[]>
  modelValue: ComputedRef<string | string[] | null>
  configWithDefaults: ComputedRef<SelectionCardConfig>
  shouldExpand: (item: SelectionCardItem) => boolean
}

export interface UseSelectionCardGroupStateReturn {
  expandedCardIds: Ref<string[]>
  nestedSelections: Ref<Record<string, string[]>>
  expansionStates: ComputedRef<Record<string, boolean>>
  internalValue: ComputedRef<string | string[] | null>
  handleNestedSelection: (itemId: string, componentIds: string[]) => void
  toggleCardExpansion: (itemId: string) => void
}
