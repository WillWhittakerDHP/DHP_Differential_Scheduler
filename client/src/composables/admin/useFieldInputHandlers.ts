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

import { computed } from 'vue'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { FieldKeyboardGuardType } from '@/composables/admin/useFieldKeyboardGuard'
import { useFieldKeyboardGuard } from '@/composables/admin/useFieldKeyboardGuard'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFieldInputHandlers')

export interface UseFieldInputHandlersParams {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  disableAutoSave?: boolean
  entityCardSaveContext?: EntityCardSaveContext | null
  /** Keyboard guard field type; default 'text' */
  fieldType?: FieldKeyboardGuardType
}

/**
 * LEARNING: Shared field input handlers
 * WHY: Provides consistent behavior across all field input components
 * PATTERN: Centralized handlers for focus, blur, and enter key events
 */
export function useFieldInputHandlers(params: UseFieldInputHandlersParams) {
  const {
    fieldContext,
    disableAutoSave = false,
    entityCardSaveContext = null,
    fieldType = 'text'
  } = params

  const isEditable = computed(
    () => !fieldContext.displayConfig.disabled && !fieldContext.displayConfig.readOnly
  )

  const handleFocus = (): void => {
    fieldContext.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.setFocus(false)
    
    // PATTERN: Match handleEnterKey behavior - new entities use handleSave, not field-level save
    if (entityCardSaveContext?.isNew) {
      return
    }
    
    // PATTERN: Skip auto-save if disableAutoSave flag is set
    if (disableAutoSave) {
      return
    }
    
    const isValid = await fieldContext.validate()
    
    if (isValid) {
      try {
        await fieldContext.save()
      } catch (error) {
        logger.error('Field save failed', {
          fieldKey: String(fieldContext.fieldKey),
          entityId: String(fieldContext.entityId),
          error
        })
      }
    }
  }

  const handleEnterKey = async (event: KeyboardEvent): Promise<void> => {
    event.preventDefault()
    
    const isValid = await fieldContext.validate()
    
    if (!isValid) {
      return
    }
    
    // PATTERN: Check if we're in a create card context and use handleSave if available
    if (entityCardSaveContext?.isNew && entityCardSaveContext.handleSave) {
      try {
        await entityCardSaveContext.handleSave()
        fieldContext.setFocus(false)
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        logger.warn('Failed to save new entity card on blur', { error, fieldKey: fieldContext.fieldKey })
      }
    } else {
      try {
        await fieldContext.save()
        fieldContext.setFocus(false)
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        logger.warn('Failed to save field on blur', { error, fieldKey: fieldContext.fieldKey })
      }
    }
  }

  const { handleKeydown } = useFieldKeyboardGuard({
    fieldType,
    isEditable,
    onEnter: handleEnterKey
  })

  return {
    handleFocus,
    handleBlur,
    handleEnterKey,
    handleKeydown
  }
}
