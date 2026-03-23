import { computed } from 'vue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import {
  persistFieldAfterBlurValidate,
  persistFieldOnEnterWithBlur,
} from '@/utils/admin/fieldInputSaveBlur'
import type { UseFieldInputHandlersParams } from '@/types/admin/fieldInputHandlers'

export interface UseFieldInputHandlersReturn {
  handleFocus: () => void
  handleBlur: () => Promise<void>
  handleEnterKey: (event: KeyboardEvent) => Promise<void>
  handleKeydown: (event: KeyboardEvent) => void
}

export function useFieldInputHandlers(params: UseFieldInputHandlersParams): UseFieldInputHandlersReturn {
  const {
    fieldContext,
    disableAutoSave = false,
    entityCardSaveContext = null,
    fieldType = 'text',
  } = params

  const isEditable = computed(
    () => !fieldContext.state.displayConfig.disabled && !fieldContext.state.displayConfig.readOnly
  )

  const handleFocus = (): void => {
    fieldContext.actions.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.actions.setFocus(false)

    if (entityCardSaveContext?.isNew) {
      return
    }

    if (disableAutoSave) {
      return
    }

    await persistFieldAfterBlurValidate(fieldContext)
  }

  const handleEnterKey = async (event: KeyboardEvent): Promise<void> => {
    event.preventDefault()
    await persistFieldOnEnterWithBlur(fieldContext, entityCardSaveContext, event.target)
  }

  const { handleKeydown } = fieldKeyboardGuard({
    fieldType,
    isEditable,
    onEnter: handleEnterKey,
  })

  return {
    handleFocus,
    handleBlur,
    handleEnterKey,
    handleKeydown,
  }
}
