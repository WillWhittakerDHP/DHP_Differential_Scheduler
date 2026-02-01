/**
 * Icon Picker State Composable
 * 
 * LEARNING: Extracts icon picker state management from IconPicker component
 * WHY: Moves state sync logic out of component into reusable composable
 * PATTERN: Composable that manages icon selection state and syncs with props
 * 
 * This composable handles:
 * - Icon selection state
 * - Syncing internal state with currentIcon prop
 * - Resetting state when dialog closes
 */

import { ref, watch, type Ref } from 'vue'

export interface UseIconPickerStateOptions {
  dialogOpen: Ref<boolean>
  
  currentIcon?: Ref<string | null> | string | null
}

export interface UseIconPickerStateReturn {
  selectedIcon: Ref<string | null>
  
  searchTerm: Ref<string>
  
  resetState: () => void
}

/**
 * Icon Picker State Composable
 * 
 * LEARNING: Manages icon picker state and syncs with props
 * WHY: Extracts state management from component to composable
 * PATTERN: Composable with state refs and watchers for prop sync
 */
export function useIconPickerState(
  options: UseIconPickerStateOptions
): UseIconPickerStateReturn {
  const {
    dialogOpen,
    currentIcon
  } = options
  
  /**
   * LEARNING: Selected icon state
   * WHY: Tracks which icon is currently selected
   * PATTERN: Ref initialized with currentIcon prop value
   */
  const currentIconValue = typeof currentIcon === 'string' || currentIcon === null
    ? currentIcon
    : currentIcon?.value ?? null
  
  const selectedIcon = ref<string | null>(currentIconValue || null)
  
  /**
   * LEARNING: Search term state
   * WHY: Tracks search input for filtering icons
   * PATTERN: Ref for search term string
   */
  const searchTerm = ref('')
  
  /**
   * LEARNING: Watch for currentIcon prop changes
   * WHY: When dialog opens with existing icon, highlight it
   * PATTERN: Watch prop and update local state
   */
  if (currentIcon && typeof currentIcon !== 'string' && currentIcon !== null) {
    watch(currentIcon, (newIcon) => {
      selectedIcon.value = newIcon || null
    }, { immediate: true })
  }
  
  /**
   * LEARNING: Reset state when dialog closes
   * WHY: Clears search and resets selection when dialog closes
   * PATTERN: Function that resets state to initial values
   */
  const resetState = (): void => {
    searchTerm.value = ''
    const currentIconValue = typeof currentIcon === 'string' || currentIcon === null
      ? currentIcon
      : currentIcon?.value || null
    selectedIcon.value = currentIconValue || null
  }
  
  /**
   * LEARNING: Watch dialog open state and reset when dialog closes
   * WHY: Ensures clean state when dialog reopens
   * PATTERN: Watch dialogOpen ref, reset state when it becomes false
   */
  watch(dialogOpen, (isOpen) => {
    if (!isOpen) {
      resetState()
    }
  })
  
  return {
    selectedIcon,
    searchTerm,
    resetState
  }
}




