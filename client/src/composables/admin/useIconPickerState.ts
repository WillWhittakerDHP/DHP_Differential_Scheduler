/**
 * WHY: Icon Picker State Composable

LEARNING: Extracts icon picker state manag...
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
 * WHY: Icon Picker State Composable

WHY: Extracts state management from compon...
 */
export function useIconPickerState(
  options: UseIconPickerStateOptions
): UseIconPickerStateReturn {
  const {
    dialogOpen,
    currentIcon
  } = options
  
  /**
   */
  const currentIconValue = typeof currentIcon === 'string' || currentIcon === null
    ? currentIcon
    : currentIcon?.value ?? null
  
  const selectedIcon = ref<string | null>(currentIconValue || null)
  
  /**
   */
  const searchTerm = ref('')
  
  /**
   * PATTERN: Watch prop and update local state
   */
  if (currentIcon && typeof currentIcon !== 'string' && currentIcon !== null) {
    watch(currentIcon, (newIcon) => {
      selectedIcon.value = newIcon || null
    }, { immediate: true })
  }
  
  /**
LEARNING: Reset state when dialog closes
PATTERN: Function that rese...
   */
  const resetState = (): void => {
    searchTerm.value = ''
    const currentIconValue = typeof currentIcon === 'string' || currentIcon === null
      ? currentIcon
      : currentIcon?.value || null
    selectedIcon.value = currentIconValue || null
  }
  
  /**
LEARNING: Watch dialog open state and reset when dialog closes
PATTE...
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




