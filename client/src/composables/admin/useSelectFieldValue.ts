/**
 * WHY: Select Field Value Composable

WHY: Components should be thin UI wrapper...
 */
import { computed } from 'vue'
import {
  collectSelectableOptionValues,
  normalizeSingleSelectFieldValue,
  resolveMultipleSelectComputedValue,
} from '@/utils/admin/selectFieldValueResolution'
import type { UseSelectFieldValueOptions, UseSelectFieldValueReturn } from '@/types/admin/selectFieldValue'

/**
 * WHY: Select Field Value Composable

WHY: Moves business logic out of componen...
 */
export function useSelectFieldValue(options: UseSelectFieldValueOptions): UseSelectFieldValueReturn {
  const { rawFieldValue, isMultiple, options: selectOptions, fieldContext } = options

  const fieldValue = computed(() => {
    const optionValues = collectSelectableOptionValues(selectOptions.value)
    const value = rawFieldValue.value
    const fieldKeyStr = String(fieldContext.state.fieldKey)

    if (isMultiple.value) {
      return resolveMultipleSelectComputedValue(value, optionValues)
    }

    return normalizeSingleSelectFieldValue(value, optionValues, fieldKeyStr)
  })

  return {
    fieldValue,
  }
}
