/**
 * WHY: Select Handlers Composable

WHY: Components should be thin UI wrappers -...
 */
import { ref, nextTick, computed } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { createLogger } from '@/utils/logger'
import type { UseSelectHandlersOptions, UseSelectHandlersReturn } from '@/types/admin/selectHandlers'

const logger = createLogger('useSelectHandlers')


/**
 * WHY: Select Handlers Composable

WHY: Moves business logic out of components ...
 */
export function useSelectHandlers(
  options: UseSelectHandlersOptions
): UseSelectHandlersReturn {
  const {
    fieldContext,
    rawFieldValue,
    fieldValue,
    isMultiple,
    groupedByKey,
    entityCardSaveContext = null,
    disableAutoSave = false
  } = options

  const isUpdatingProgrammatically = ref(false)

  const handleGroupChange = async (groupKey: string, groupValue: string | string[] | null): Promise<void> => {
    const currentValue = rawFieldValue.value
    const currentArray = Array.isArray(currentValue)
      ? currentValue.map((v) => String(v))
      : currentValue ? [String(currentValue)] : []

    const groups = groupedByKey.value
    const group = groups.find((g) => g.groupKey === groupKey)
    if (!group) return

    const groupEntityIds = new Set(group.entities.map((e: unknown) => toGlobalEntityId(String((e as { id: unknown }).id))))
    const otherGroupValues = currentArray.filter((v) => !groupEntityIds.has(toGlobalEntityId(v)))
    
    const newGroupValues = Array.isArray(groupValue)
      ? groupValue.map(v => String(v)).filter(v => v !== '')
      : groupValue ? [String(groupValue)] : []
    
    const combinedValues = [...otherGroupValues, ...newGroupValues]
    const uniqueValues = Array.from(new Set(combinedValues))
    
    const finalValue = isMultiple.value ? uniqueValues : (uniqueValues[0] ?? undefined)
    fieldContext.actions.setValue(finalValue)
  }

  const handleChange = async (value: string | string[] | null): Promise<void> => {
    // PATTERN: Check flag before processing update
    if (isUpdatingProgrammatically.value) {
      return
    }
    
    let normalizedValue: string | string[] | undefined = value ?? undefined
    
    if (isMultiple.value) {
      if (value === null || value === undefined) {
        normalizedValue = []
      } else if (Array.isArray(value)) {
        normalizedValue = value.map(v => String(v)).filter(v => v !== '')
      } else {
        const currentValue = fieldValue.value
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newValueStr = String(value)
        
        if (currentArray.includes(newValueStr)) {
          normalizedValue = currentArray.filter(v => v !== newValueStr)
        } else {
          normalizedValue = [...currentArray, newValueStr]
        }
      }
    } else {
      if (value === null || value === undefined || value === '') {
        normalizedValue = undefined
      } else if (Array.isArray(value)) {
        normalizedValue = value.length > 0 ? String(value[0]) : undefined
      } else {
        const stringValue = String(value)
        // PATTERN: Use sentinel value '__NULL__' in options, convert back to null when saving
        if (stringValue === '__NULL__' && String(fieldContext.state.fieldKey) === 'ternaryDefault') {
          normalizedValue = undefined // Will be saved as null
        } else {
          normalizedValue = stringValue
        }
      }
    }
    
    // PATTERN: Compare normalized value with current field value before updating
    const currentFieldValue = fieldValue.value
    const currentArray = Array.isArray(currentFieldValue) ? currentFieldValue : (currentFieldValue ? [String(currentFieldValue)] : [])
    const normalizedArray = Array.isArray(normalizedValue) ? normalizedValue : (normalizedValue ? [String(normalizedValue)] : [])
    const currentSorted = [...currentArray].sort().join(',')
    const normalizedSorted = [...normalizedArray].sort().join(',')
    
    if (currentSorted !== normalizedSorted) {
      // PATTERN: Set flag, update, then clear flag in nextTick to allow future user updates
      isUpdatingProgrammatically.value = true
      try {
        fieldContext.actions.setValue(normalizedValue)
        await nextTick()
      } finally {
        isUpdatingProgrammatically.value = false
      }
    }
  }

  /**
   * WHY: Component needs to track focus state
   */
  const handleFocus = (): void => {
    fieldContext.actions.setFocus(true)
  }

  const handleBlur = async (): Promise<void> => {
    fieldContext.actions.setFocus(false)
    
    // PATTERN: Match useFieldInputHandlers behavior - new entities use handleSave, not field-level save
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
        logger.warn('Failed to save field on blur', { error, fieldKey: fieldContext.state.fieldKey })
      }
    }
  }

  const isEditable = computed(
    () => !fieldContext.state.displayConfig.disabled && !fieldContext.state.displayConfig.readOnly
  )
  const { handleKeydown } = fieldKeyboardGuard({
    fieldType: 'select',
    isEditable
  })

  return {
    isUpdatingProgrammatically,
    handleGroupChange,
    handleChange,
    handleFocus,
    handleBlur,
    handleKeydown
  }
}

