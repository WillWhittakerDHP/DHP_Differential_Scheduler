import { computed, type ComputedRef, type Ref } from 'vue'
import { filterFieldsInConfigOrder } from '@/utils/forms/layoutFieldCategorization'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseFormFieldsStandardLayoutReturn } from './types'

type UseFormFieldsStandardLayoutOptions<GE extends GlobalEntityKey> = {
  fieldKeys: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  inlineFieldsConfig: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  stackedFieldsConfig: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  getReadyFields: (fields: GlobalFieldKey<GE>[]) => GlobalFieldKey<GE>[]
}

export type { UseFormFieldsStandardLayoutReturn }

export function useFormFieldsStandardLayout<GE extends GlobalEntityKey>(
  options: UseFormFieldsStandardLayoutOptions<GE>
): UseFormFieldsStandardLayoutReturn<GE> {
  const inlineFields = computed(() => {
    const fields = asEmptyArray(options.fieldKeys.value).map(String)
    const config = asEmptyArray(options.inlineFieldsConfig.value).map(String)
    return filterFieldsInConfigOrder(fields, config) as GlobalFieldKey<GE>[]
  })

  const stackedFields = computed(() => {
    const fields = asEmptyArray(options.fieldKeys.value).map(String)
    const config = asEmptyArray(options.stackedFieldsConfig.value).map(String)
    return filterFieldsInConfigOrder(fields, config) as GlobalFieldKey<GE>[]
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
