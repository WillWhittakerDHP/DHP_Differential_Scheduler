import { computed } from 'vue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { createLogger } from '@/utils/logger'
import type { UseFieldInputHandlersParams } from '@/types/admin/fieldInputHandlers'

export type { UseFieldInputHandlersParams } from '@/types/admin/fieldInputHandlers'

const logger = createLogger('useFieldInputHandlers')

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

  const { handleKeydown } = fieldKeyboardGuard({
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
