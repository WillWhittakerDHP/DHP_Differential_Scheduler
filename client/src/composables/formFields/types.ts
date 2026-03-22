import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { FieldsByLayout } from '@/utils/forms/layoutFieldCategorization'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

/** Base shared by UseFormFieldsOptions and UseFormFieldsContextOptions (P2 type-similarity). */
export interface UseFormFieldsOptionsBase {
  entityKey: GlobalEntityKey
  entityId: Ref<GlobalEntityId>
  form: Ref<FormContext | undefined>
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  fieldMetadata?: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  adminConfig?: ReturnType<typeof useAdminConfig>
}

export interface UseFormFieldsOptions extends UseFormFieldsOptionsBase {
  inlineFieldsConfig?: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig?: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export type UseFormFieldsContextOptions = UseFormFieldsOptionsBase

/** Layout subset shared by UseFormFieldsReturn and UseFormFieldsStandardLayoutReturn (P2 type-similarity). */
export interface UseFormFieldsStandardLayoutReturn {
  inlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}

export interface UseFormFieldsReturn extends UseFormFieldsStandardLayoutReturn {
  fieldContextCache: Ref<Map<string, FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  getFieldContext: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ) => FieldContextTypeGrouped<GE, FieldKey> | undefined

  getBlockShapeProperties: () => { composable: boolean; canHaveParts: boolean }
  shouldShowPartInstances: Ref<boolean>

  categorizeFieldsByLayout: (fields: GlobalFieldKey<GlobalEntityKey>[]) => FieldsByLayout
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]
}


