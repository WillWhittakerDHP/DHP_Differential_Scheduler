import type { Ref, ComputedRef } from 'vue'
import type { SelectionCardItem, SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export interface UseSelectionCardOptions {
  item: Ref<SelectionCardItem> | SelectionCardItem
  modelValue: Ref<string | null | string[]>
  config: Ref<SelectionCardConfig> | SelectionCardConfig
  nestedChildSelections?: Ref<string[]>
  isExpanded?: Ref<boolean>
}

export interface UseSelectionCardReturn {
  isSelected: Ref<boolean>
  visibleChildren: Ref<SelectionCardItem[]>
  hasChildren: Ref<boolean>
  handleSelection: () => void
  toggleExpansion: () => void
  isNestedChildSelected: (childId: string) => boolean
  handleNestedChildUpdate: (childId: string, selected: boolean) => void
}

export interface UseSelectionCardGroupOptions {
  items: Ref<SelectionCardItem[]> | SelectionCardItem[]
  modelValue: Ref<string | string[] | null> | ComputedRef<string | string[] | null>
  config?: Ref<SelectionCardConfig> | SelectionCardConfig
}

export interface UseSelectionCardGroupReturn {
  shouldExpand: (item: SelectionCardItem) => boolean
  toggleCardExpansion: (itemId: string) => void
  handleNestedSelection: (itemId: string, componentIds: string[]) => void
}
