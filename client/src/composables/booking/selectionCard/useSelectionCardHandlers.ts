/**
 * WHY: useSelectionCardHandlers Composable

WHY: Moves selection handling, nest...
 */
import { type ComputedRef } from 'vue'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'
import { isNestedComponentsClick, toggleSelectionModelValue, updateNestedChildSelections } from '@/utils/booking/selectionCardHandlers'

export interface UseSelectionCardHandlersParams {
  item: ComputedRef<SelectionCardItem>
  modelValue: ComputedRef<string | null | string[]>
  nestedChildSelections: ComputedRef<string[]>
  activeStatePlugin: ComputedRef<StatePlugin | null>
  isSelected: ComputedRef<boolean>
  emit: {
    (e: 'update:modelValue', value: string | null | string[]): void
    (e: 'update:nestedChildSelections', childIds: string[]): void
    (e: 'toggle-expansion'): void
  }
  isExpanded: ComputedRef<boolean | undefined>
  localExpanded: { value: boolean }
}

export interface UseSelectionCardHandlersReturn {
  handleSelection: () => void
  handleNestedChildUpdate: (childId: string, selected: boolean) => void
  handleParentClick: (e: Event) => void
  toggleExpansion: () => void
}

/**
 * WHY: useSelectionCardHandlers composable

WHY: Extracts handler logic from co...
 */
export function useSelectionCardHandlers(params: UseSelectionCardHandlersParams): UseSelectionCardHandlersReturn {
  const {
    item,
    modelValue,
    nestedChildSelections,
    activeStatePlugin,
    isSelected,
    emit,
    isExpanded,
    localExpanded
  } = params

  /**
   * PATTERN: Use state plugin to update selection state, fallback to emit
   */
  const handleSelection = (): void => {
    const plugin = activeStatePlugin.value
    if (plugin) {
      const newValue = !isSelected.value
      plugin.setValue(item.value, newValue)
      return
    }
    
    // Fallback to emit for backward compatibility
    emit(
      'update:modelValue',
      toggleSelectionModelValue({
        itemId: item.value.id,
        modelValue: modelValue.value,
        isSelected: isSelected.value,
      })
    )
  }

  const handleNestedChildUpdate = (childId: string, selected: boolean): void => {
    const raw = nestedChildSelections.value
    const current = raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []
    emit(
      'update:nestedChildSelections',
      updateNestedChildSelections({
        current,
        childId,
        selected,
      })
    )
  }

  const handleParentClick = (e: Event): void => {
    if (isNestedComponentsClick(e.target)) {
      e.stopPropagation()
      return
    }
    
    handleSelection()
  }

  const toggleExpansion = (): void => {
    if (isExpanded.value !== undefined) {
      emit('toggle-expansion')
    } else {
      localExpanded.value = !localExpanded.value
    }
  }

  return {
    handleSelection,
    handleNestedChildUpdate,
    handleParentClick,
    toggleExpansion
  }
}


