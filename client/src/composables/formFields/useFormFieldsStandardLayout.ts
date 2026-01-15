import { computed, type Ref, type ComputedRef } from 'vue'
import { filterFieldsInConfigOrder } from '@/utils/forms/layoutFieldCategorization'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

type UseFormFieldsStandardLayoutOptions = {
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  inlineFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
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
 * LEARNING: Field visibility comes from metadata, not config
 * WHY: Metadata is the single source of truth for which fields should render
 * PATTERN: Fields with visibility: 'hidden' in metadata won't render
 */
export function useFormFieldsStandardLayout(
  options: UseFormFieldsStandardLayoutOptions
): UseFormFieldsStandardLayoutReturn {
  const inlineFields = computed(() => {
    const fields = options.fieldKeys.value || []
    const config = options.inlineFieldsConfig.value || []
    return filterFieldsInConfigOrder(fields, config)
  })

  const stackedFields = computed(() => {
    const fields = options.fieldKeys.value || []
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


