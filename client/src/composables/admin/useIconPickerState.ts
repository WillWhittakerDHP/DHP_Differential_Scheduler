/**
 * WHY: Icon Picker State Composable

 */
import { ref, watch } from 'vue'
import type { UseIconPickerStateOptions, UseIconPickerStateReturn } from '@/types/admin/iconPickerState'

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
  
  const resetState = (): void => {
    searchTerm.value = ''
    const currentIconValue = typeof currentIcon === 'string' || currentIcon === null
      ? currentIcon
      : currentIcon?.value || null
    selectedIcon.value = currentIconValue || null
  }
  
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
