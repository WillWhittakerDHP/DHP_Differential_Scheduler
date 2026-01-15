/**
 * LEARNING: Shared field input handlers
 * WHY: Field input handlers (focus, blur, enter key) are duplicated across NumberInput and TextInput
 * PATTERN: Extract shared handler logic into composable
 * 
 * Used by:
 * - NumberInput.vue
 * - TextInput.vue
 * - DateInput.vue
 * - TextAreaInput.vue
 */

import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'

export interface UseFieldInputHandlersParams {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  disableAutoSave?: boolean
  entityCardSaveContext?: EntityCardSaveContext | null
}

/**
 * LEARNING: Shared field input handlers
 * WHY: Provides consistent behavior across all field input components
 * PATTERN: Centralized handlers for focus, blur, and enter key events
 */
export function useFieldInputHandlers(params: UseFieldInputHandlersParams) {
  const { fieldContext, disableAutoSave = false, entityCardSaveContext = null } = params

  const handleFocus = (): void => {
    fieldContext.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.setFocus(false)
    
    // LEARNING: Check if auto-save is disabled before saving
    // WHY: Bulk edit modals use template entities that shouldn't be auto-saved on blur
    // PATTERN: Skip auto-save if disableAutoSave flag is set
    if (disableAutoSave) {
      return
    }
    
    const isValid = await fieldContext.validate()
    
    if (isValid) {
      try {
        await fieldContext.save()
      } catch (error) {
        // Auto-save failed
      }
    }
  }

  const handleEnterKey = async (event: KeyboardEvent): Promise<void> => {
    // Prevent default form submission behavior
    event.preventDefault()
    
    // Validate field
    const isValid = await fieldContext.validate()
    
    if (!isValid) {
      return
    }
    
    // LEARNING: For create cards, save entire form instead of just the field
    // WHY: Creates the entity and triggers collapse logic via onSaved callback
    // PATTERN: Check if we're in a create card context and use handleSave if available
    if (entityCardSaveContext?.isNew && entityCardSaveContext.handleSave) {
      try {
        await entityCardSaveContext.handleSave()
        // Blur the field after successful save to remove focus
        fieldContext.setFocus(false)
        // Blur the actual input element
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        // Save failed
      }
    } else {
      // For existing entities, save just the field
      try {
        await fieldContext.save()
        // Blur the field after successful save
        fieldContext.setFocus(false)
        // Blur the actual input element
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        // Save failed
      }
    }
  }

  return {
    handleFocus,
    handleBlur,
    handleEnterKey
  }
}
