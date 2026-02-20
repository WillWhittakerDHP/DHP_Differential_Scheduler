import { computed, type Ref } from 'vue'
import { filterFieldsInConfigOrder } from '@/utils/forms/layoutFieldCategorization'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseFormFieldsStandardLayoutReturn } from './types'

type UseFormFieldsStandardLayoutOptions = {
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  inlineFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]
}

export type { UseFormFieldsStandardLayoutReturn }

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
    const fields = (options.fieldKeys.value || []).map(String)
    const config = (options.inlineFieldsConfig.value || []).map(String)
    return filterFieldsInConfigOrder(fields, config) as GlobalFieldKey<GlobalEntityKey>[]
  })

  const stackedFields = computed(() => {
    const fields = (options.fieldKeys.value || []).map(String)
    const config = (options.stackedFieldsConfig.value || []).map(String)
    return filterFieldsInConfigOrder(fields, config) as GlobalFieldKey<GlobalEntityKey>[]
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


