/**
 * LEARNING: Shared field input setup
 * WHY: Field input setup code is duplicated across DateInput and TextAreaInput
 * PATTERN: Extract shared setup logic into composable
 * 
 * Used by:
 * - DateInput.vue
 * - TextAreaInput.vue
 */

import { inject } from 'vue'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldKeyboardGuardType } from '@/composables/admin/useFieldKeyboardGuard'
import { useFieldValue } from '@/composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'

export interface UseFieldInputSetupOptions {
  /** Keyboard guard field type for handleKeydown; default inferred from usage (date/textarea) */
  fieldType?: FieldKeyboardGuardType
}

/**
 * LEARNING: Shared field input setup
 * WHY: Provides consistent setup for field input components
 * PATTERN: Centralized setup for field context, value, and handlers
 */
export function useFieldInputSetup(
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>,
  options: UseFieldInputSetupOptions = {}
) {
  const { fieldType } = options
  /**
   * LEARNING: Inject EntityCard save handler for create cards
   * WHY: When creating new entities, pressing Enter should save the entire form and collapse,
   *      not just save the individual field
   * PATTERN: Use inject to access parent EntityCard's handleSave method
   */
  const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

  /**
   * LEARNING: Inject disableAutoSave flag from EntityCard
   * WHY: Allows parent to disable field blur auto-save (e.g., in bulk edit modals)
   * PATTERN: Use inject to access parent EntityCard's disableAutoSave flag
   */
  const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

  // LEARNING: Use unified field value composable
  // WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
  // PATTERN: Always use useFieldValue for accessing field values
  const fieldValue = useFieldValue(fieldContext)

  const handleChange = (value: string) => {
    fieldContext.setValue(value)
  }

  // FIX: Use shared field input handlers from composable
  const { handleFocus, handleBlur, handleKeydown } = useFieldInputHandlers({
    fieldContext,
    disableAutoSave,
    entityCardSaveContext,
    fieldType
  })

  return {
    fieldValue,
    handleChange,
    handleFocus,
    handleBlur,
    handleKeydown
  }
}
