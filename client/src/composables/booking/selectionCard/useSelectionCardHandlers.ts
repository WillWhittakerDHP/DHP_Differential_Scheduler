/**
 * useSelectionCardHandlers Composable
 * 
 * LEARNING: Extracts selection handlers logic from SelectionCard component
 * WHY: Moves selection handling, nested child updates, and parent click handling to composable
 * PATTERN: Composable that provides handler functions
 */

import { type ComputedRef } from 'vue'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'
import { isNestedComponentsClick, toggleSelectionModelValue, updateNestedChildSelections } from '@/utils/booking/selectionCardHandlers'

/**
 * useSelectionCardHandlers composable parameters
 */
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

/**
 * useSelectionCardHandlers composable return type
 */
export interface UseSelectionCardHandlersReturn {
  handleSelection: () => void
  handleNestedChildUpdate: (childId: string, selected: boolean) => void
  handleParentClick: (e: Event) => void
  toggleExpansion: () => void
}

/**
 * useSelectionCardHandlers composable
 * 
 * LEARNING: Provides selection handlers
 * WHY: Extracts handler logic from component to composable
 * PATTERN: Composable that returns handler functions
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
   * LEARNING: Handle selection click
   * WHY: Explicit selection handling replaces VRadioGroup's automatic handling
   * PATTERN: Use state plugin to update selection state, fallback to emit
   */
  const handleSelection = (): void => {
    const plugin = activeStatePlugin.value
    if (plugin) {
      // Toggle selection: if already selected, deselect; otherwise select
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

  /**
   * LEARNING: Handle nested child selection update
   * WHY: Updates nested child selections array
   * PATTERN: Add or remove child ID from array
   */
  const handleNestedChildUpdate = (childId: string, selected: boolean): void => {
    emit(
      'update:nestedChildSelections',
      updateNestedChildSelections({
        current: nestedChildSelections.value || [],
        childId,
        selected,
      })
    )
  }

  /**
   * LEARNING: Handle parent card click
   * WHY: Explicit click handling replaces VRadioGroup's automatic handling
   * PATTERN: Check for nested clicks, then handle selection
   */
  const handleParentClick = (e: Event): void => {
    // Don't select if clicking on nested components
    if (isNestedComponentsClick(e.target)) {
      e.stopPropagation()
      return
    }
    
    // Handle selection explicitly
    handleSelection()
  }

  /**
   * LEARNING: Toggle expansion
   */
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


