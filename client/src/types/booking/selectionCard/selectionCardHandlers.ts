import type { ComputedRef, Ref } from 'vue'

type RefLikeBoolean = Ref<boolean> | { value: boolean }
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

export interface UseSelectionCardHandlersParams {
  item: ComputedRef<SelectionCardItem>
  modelValue: ComputedRef<string | null | string[]>
  nestedChildSelections: ComputedRef<string[]>
  activeStatePlugin: ComputedRef<StatePlugin | null>
  isSelected: ComputedRef<boolean> | Ref<boolean>
  emit: {
    (e: 'update:modelValue', value: string | null | string[]): void
    (e: 'update:nestedChildSelections', childIds: string[]): void
    (e: 'toggle-expansion'): void
  }
  isExpanded: ComputedRef<boolean | undefined>
  localExpanded: RefLikeBoolean
  /** When provided, composable runs watch to auto-expand when selected (uncontrolled only). */
  hasChildren?: ComputedRef<boolean> | Ref<boolean>
}

export interface UseSelectionCardHandlersReturn {
  handleSelection: () => void
  handleNestedChildUpdate: (childId: string, selected: boolean) => void
  handleParentClick: (e: Event) => void
  toggleExpansion: () => void
}
