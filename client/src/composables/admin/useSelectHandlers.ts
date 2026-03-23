/**
 * WHY: Select Handlers Composable

WHY: Components should be thin UI wrappers -...
 */
import { ref, nextTick, computed } from 'vue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { createLogger } from '@/utils/logger'
import type { UseSelectHandlersOptions, UseSelectHandlersReturn } from '@/types/admin/selectHandlers'
import {
  normalizeSelectChangeValue,
  selectValuesAreEqual,
} from '@/utils/admin/selectHandlersNormalization'

const logger = createLogger('useSelectHandlers')

/**
 * WHY: Select Handlers Composable

WHY: Moves business logic out of components ...
 */
export function useSelectHandlers(options: UseSelectHandlersOptions): UseSelectHandlersReturn {
  const {
    fieldContext,
    rawFieldValue: _rawFieldValue,
    fieldValue,
    isMultiple,
    entityCardSaveContext = null,
    disableAutoSave = false,
  } = options

  const isUpdatingProgrammatically = ref(false)

  const handleChange = async (value: string | string[] | null): Promise<void> => {
    if (isUpdatingProgrammatically.value) {
      return
    }

    const fieldKeyStr = String(fieldContext.state.fieldKey)
    const normalizedValue = normalizeSelectChangeValue(
      value,
      isMultiple.value,
      fieldKeyStr,
      fieldValue.value
    )

    if (!selectValuesAreEqual(fieldValue.value, normalizedValue)) {
      isUpdatingProgrammatically.value = true
      try {
        fieldContext.actions.setValue(normalizedValue)
        await nextTick()
      } finally {
        isUpdatingProgrammatically.value = false
      }
    }
  }

  const handleFocus = (): void => {
    fieldContext.actions.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.actions.setFocus(false)

    if (entityCardSaveContext?.isNew || disableAutoSave) {
      return
    }

    const isValid = await fieldContext.actions.validate()

    if (isValid) {
      try {
        await fieldContext.actions.save()
      } catch (error) {
        logger.warn('Failed to save field on blur', { error, fieldKey: fieldContext.state.fieldKey })
      }
    }
  }

  const isEditable = computed(
    () => !fieldContext.state.displayConfig.disabled && !fieldContext.state.displayConfig.readOnly
  )
  const { handleKeydown } = fieldKeyboardGuard({
    fieldType: 'select',
    isEditable,
  })

  return {
    isUpdatingProgrammatically,
    handleChange,
    handleFocus,
    handleBlur,
    handleKeydown,
  }
}
