import { computed } from 'vue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { createLogger } from '@/utils/logger'
import type { UseFieldInputHandlersParams } from '@/types/admin/fieldInputHandlers'


export interface UseFieldInputHandlersReturn {
  handleFocus: () => void
  handleBlur: () => Promise<void>
  handleEnterKey: (event: KeyboardEvent) => Promise<void>
  handleKeydown: (event: KeyboardEvent) => void
}

const logger = createLogger('useFieldInputHandlers')

export function useFieldInputHandlers(params: UseFieldInputHandlersParams): UseFieldInputHandlersReturn {
  const {
    fieldContext,
    disableAutoSave = false,
    entityCardSaveContext = null,
    fieldType = 'text'
  } = params

  const isEditable = computed(
    () => !fieldContext.state.displayConfig.disabled && !fieldContext.state.displayConfig.readOnly
  )

  const handleFocus = (): void => {
    fieldContext.actions.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.actions.setFocus(false)
    
    // PATTERN: Match handleEnterKey behavior - new entities use handleSave, not field-level save
    if (entityCardSaveContext?.isNew) {
      return
    }
    
    // PATTERN: Skip auto-save if disableAutoSave flag is set
    if (disableAutoSave) {
      return
    }
    
    const isValid = await fieldContext.actions.validate()
    
    if (isValid) {
      try {
        await fieldContext.actions.save()
      } catch (error) {
        logger.error('Field save failed', {
          fieldKey: String(fieldContext.state.fieldKey),
          entityId: String(fieldContext.state.entityId),
          error
        })
      }
    }
  }

  const handleEnterKey = async (event: KeyboardEvent): Promise<void> => {
    event.preventDefault()
    
    const isValid = await fieldContext.actions.validate()
    
    if (!isValid) {
      return
    }
    
    // PATTERN: Check if we're in a create card context and use handleSave if available
    if (entityCardSaveContext?.isNew && entityCardSaveContext.handleSave) {
      try {
        await entityCardSaveContext.handleSave()
        fieldContext.actions.setFocus(false)
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        logger.warn('Failed to save new entity card on blur', { error, fieldKey: fieldContext.state.fieldKey })
      }
    } else {
      try {
        await fieldContext.actions.save()
        fieldContext.actions.setFocus(false)
        const target = event.target as HTMLElement
        if (target && 'blur' in target && typeof target.blur === 'function') {
          target.blur()
        }
      } catch (error) {
        logger.warn('Failed to save field on blur', { error, fieldKey: fieldContext.state.fieldKey })
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
