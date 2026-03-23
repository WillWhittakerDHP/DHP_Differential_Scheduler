import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { FieldsByLayout } from '@/utils/forms/layoutFieldCategorization'
import type { UseFormFieldsReturn } from '@/composables/formFields/types'
import type { UseFormFieldsStandardLayoutReturn } from '@/composables/formFields/layoutTypes'

export interface BuildUseFormFieldsReturnParts<GE extends GlobalEntityKey> {
  fieldContextCache: Ref<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>> | ShallowRef<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GE>[]>
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined
  getBlockShapeProperties: () => { composable: boolean; canHaveParts: boolean }
  shouldShowPartInstances: Ref<boolean>
  categorizeFieldsByLayout: (fields: GlobalFieldKey<GE>[]) => FieldsByLayout
  getReadyFields: (fields: GlobalFieldKey<GE>[]) => GlobalFieldKey<GE>[]
  standardLayout: UseFormFieldsStandardLayoutReturn<GE>
}

/**
 * Single return site for useFormFields (function-complexity / returns threshold).
 * Lives under utils so import-graph composable chain depth does not hop through this module.
 */
export function buildUseFormFieldsReturn<GE extends GlobalEntityKey>(
  parts: BuildUseFormFieldsReturnParts<GE>
): UseFormFieldsReturn<GE> {
  const {
    fieldContextCache,
    isFormReady,
    fieldsNeedingContexts,
    getFieldContext,
    getBlockShapeProperties,
    shouldShowPartInstances,
    categorizeFieldsByLayout,
    getReadyFields,
    standardLayout,
  } = parts

  return {
    fieldContextCache,
    isFormReady,
    fieldsNeedingContexts,
    getFieldContext,
    getBlockShapeProperties,
    shouldShowPartInstances,
    categorizeFieldsByLayout,
    getReadyFields,
    inlineFields: standardLayout.inlineFields,
    stackedFields: standardLayout.stackedFields,
    readyInlineFields: standardLayout.readyInlineFields,
    readyStackedFields: standardLayout.readyStackedFields,
  }
}
