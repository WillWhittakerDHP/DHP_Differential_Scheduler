/**
 * useAnnotationDialogState Composable
 * 
 * LEARNING: Manages annotation dialog state and form handling
 * WHY: Extracts dialog state management from AnnotationsField component
 * PATTERN: Composable that manages dialog visibility, tabs, and form state
 * 
 * Features:
 * - Dialog visibility state
 * - Tab state (select/create)
 * - Form state for creating new annotations
 * - Form state for selecting existing annotations
 * - Dialog close/reset logic
 */

import { ref } from 'vue'

/**
 * useAnnotationDialogState composable
 * LEARNING: Provides dialog state management for annotation selection/creation
 * WHY: Centralizes dialog state logic for reuse
 * PATTERN: Composable that returns reactive state and handlers
 */
export function useAnnotationDialogState() {
  /**
   * Dialog visibility state
   * LEARNING: Controls whether dialog is open
   * WHY: Need reactive state for v-model binding
   * PATTERN: ref for boolean state
   */
  const showDialog = ref(false)

  /**
   * Dialog tab state (select existing vs create new)
   * LEARNING: Controls which tab is active in dialog
   * WHY: Dialog has two tabs with different forms
   * PATTERN: ref for string literal union type
   */
  const dialogTab = ref<'select' | 'create'>('select')

  /**
   * New annotation form state
   * LEARNING: Form fields for creating new annotation
   * WHY: Need reactive state for form inputs
   * PATTERN: Separate refs for each form field
   */
  const newAnnotationText = ref('')
  const newAnnotationType = ref<string | null>(null)
  const newAnnotationUserTypeBlock = ref<string | null>(null)

  /**
   * Select existing annotations form state
   * LEARNING: Form fields for selecting existing annotations
   * WHY: Need reactive state for multi-select and user type
   * PATTERN: Separate refs for selected IDs and user type
   */
  const selectedAnnotationIds = ref<string[]>([])
  const selectedUserTypeBlock = ref<string | null>(null)

  /**
   * Multi-select state (for quick add from main form)
   * LEARNING: State for quick-add multi-select above dialog
   * WHY: Users can add annotations without opening dialog
   * PATTERN: ref for array of IDs
   */
  const quickAddAnnotationIds = ref<string[]>([])

  /**
   * Open dialog
   * LEARNING: Handler to open dialog
   * WHY: Provides consistent way to open dialog
   * PATTERN: Function that sets showDialog to true
   */
  const openDialog = (): void => {
    showDialog.value = true
  }

  /**
   * Close dialog and reset all form state
   * LEARNING: Handler to close dialog and clear form
   * WHY: Ensures clean state when dialog closes
   * PATTERN: Function that resets all state to defaults
   */
  const closeDialog = (): void => {
    showDialog.value = false
    dialogTab.value = 'select'
    selectedAnnotationIds.value = []
    selectedUserTypeBlock.value = null
    newAnnotationText.value = ''
    newAnnotationType.value = null
    newAnnotationUserTypeBlock.value = null
  }

  /**
   * Reset quick-add state
   * LEARNING: Clear quick-add multi-select after adding
   * WHY: Multi-select should clear after successful add
   * PATTERN: Function that resets quickAddAnnotationIds
   */
  const resetQuickAdd = (): void => {
    quickAddAnnotationIds.value = []
  }

  return {
    // State
    showDialog,
    dialogTab,
    newAnnotationText,
    newAnnotationType,
    newAnnotationUserTypeBlock,
    selectedAnnotationIds,
    selectedUserTypeBlock,
    quickAddAnnotationIds,
    
    // Actions
    openDialog,
    closeDialog,
    resetQuickAdd,
  }
}





