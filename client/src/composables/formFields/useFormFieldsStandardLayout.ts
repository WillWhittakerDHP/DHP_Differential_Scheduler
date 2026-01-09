import { computed, type Ref, type ComputedRef } from 'vue'
import { filterFieldsInConfigOrder } from '@/utils/forms/layoutFieldCategorization'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

type UseFormFieldsStandardLayoutOptions = {
  visibleFields: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  inlineFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  omitFieldsConfig?: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]
}

export type UseFormFieldsStandardLayoutReturn = {
  inlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

/**
 * Query/state module: unified layout breakdown for ALL entity types.
 * 
 * LEARNING: Removed regularFields - fields not in inlineFields or stackedFields are hidden via omitFields
 * WHY: All fields must be explicitly categorized in config (inlineFields, stackedFields, or omitFields)
 *      No implicit "regular" category - fields are either inline, stacked, or hidden
 * PATTERN: Single unified layout mechanism for all entity types
 */
export function useFormFieldsStandardLayout(
  options: UseFormFieldsStandardLayoutOptions
): UseFormFieldsStandardLayoutReturn {
  const inlineFields = computed(() => {
    const fields = options.visibleFields.value || []
    const config = options.inlineFieldsConfig.value || []
    return filterFieldsInConfigOrder(fields, config)
  })

  const stackedFields = computed(() => {
    const fields = options.visibleFields.value || []
    const config = options.stackedFieldsConfig.value || []
    return filterFieldsInConfigOrder(fields, config)
  })

  const readyInlineFields = computed(() => options.getReadyFields(inlineFields.value))
  const readyStackedFields = computed(() => options.getReadyFields(stackedFields.value))

  return {
    inlineFields,
    stackedFields,
    readyInlineFields,
    readyStackedFields,
  }
}


