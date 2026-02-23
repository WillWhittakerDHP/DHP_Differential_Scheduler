import { computed, type Ref } from 'vue'
import { filterFieldsInConfigOrder } from '@/utils/forms/layoutFieldCategorization'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseFormFieldsStandardLayoutReturn } from './types'

type UseFormFieldsStandardLayoutOptions = {
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  inlineFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: Ref<GlobalFieldKey<GlobalEntityKey>[]>
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]
}

export type { UseFormFieldsStandardLayoutReturn }

export function useFormFieldsStandardLayout(
  options: UseFormFieldsStandardLayoutOptions
): UseFormFieldsStandardLayoutReturn {
  const inlineFields = computed(() => {
    const fields = asEmptyArray(options.fieldKeys.value).map(String)
    const config = asEmptyArray(options.inlineFieldsConfig.value).map(String)
    return filterFieldsInConfigOrder(fields, config) as GlobalFieldKey<GlobalEntityKey>[]
  })

  const stackedFields = computed(() => {
    const fields = asEmptyArray(options.fieldKeys.value).map(String)
    const config = asEmptyArray(options.stackedFieldsConfig.value).map(String)
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


