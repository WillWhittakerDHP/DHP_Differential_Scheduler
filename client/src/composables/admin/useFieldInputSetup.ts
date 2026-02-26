import type { Ref } from 'vue'
import { inject } from 'vue'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useFieldValue } from '@/composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'
import type { UseFieldInputSetupOptions } from '@/types/admin/fieldInputSetup'


export interface UseFieldInputSetupReturn {
  fieldValue: Ref<unknown>
  handleChange: (value: string) => void
  handleFocus: () => void
  handleBlur: () => Promise<void>
  handleKeydown: (e: KeyboardEvent) => void
}

export function useFieldInputSetup(
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>,
  options: UseFieldInputSetupOptions = {}
): UseFieldInputSetupReturn {
  const { fieldType } = options
  const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

  const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

  // LEARNING: Use unified field value composable
  // WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
  // PATTERN: Always use useFieldValue for accessing field values
  const fieldValue = useFieldValue(fieldContext)

  const handleChange = (value: string) => {
    fieldContext.actions.setValue(value)
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
