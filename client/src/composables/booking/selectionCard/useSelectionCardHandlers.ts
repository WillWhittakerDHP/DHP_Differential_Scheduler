/**
 * WHY: useSelectionCardHandlers Composable

WHY: Moves selection handling, nest...
 */
import { watch } from 'vue'
import { isNestedComponentsClick, toggleSelectionModelValue, updateNestedChildSelections } from '@/utils/booking/selectionCardHandlers'
import type { UseSelectionCardHandlersParams, UseSelectionCardHandlersReturn } from '@/types/booking/selectionCard/selectionCardHandlers'

export type { UseSelectionCardHandlersParams, UseSelectionCardHandlersReturn } from '@/types/booking/selectionCard/selectionCardHandlers'

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
    localExpanded,
    hasChildren,
  } = params

  if (hasChildren) {
    watch(isSelected, (newValue) => {
      if (newValue && hasChildren.value && isExpanded.value === undefined) {
        localExpanded.value = true
      }
    }, { immediate: true })
  }

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


