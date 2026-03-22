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
export interface UseFormFieldsOptionsBase<GE extends GlobalEntityKey = GlobalEntityKey> {
  entityKey: GE
  entityId: Ref<GlobalEntityId>
  form: Ref<FormContext | undefined>
  fieldKeys: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  fieldMetadata?: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  adminConfig?: ReturnType<typeof useAdminConfig>
}

export interface UseFormFieldsOptions<GE extends GlobalEntityKey = GlobalEntityKey>
  extends UseFormFieldsOptionsBase<GE> {
  inlineFieldsConfig?: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  stackedFieldsConfig?: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
}

export type UseFormFieldsContextOptions<GE extends GlobalEntityKey = GlobalEntityKey> =
  UseFormFieldsOptionsBase<GE>

/** Layout subset shared by UseFormFieldsReturn and UseFormFieldsStandardLayoutReturn (P2 type-similarity). */
export interface UseFormFieldsStandardLayoutReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  inlineFields: ComputedRef<GlobalFieldKey<GE>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GE>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GE>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GE>[]>
}

export interface UseFormFieldsReturn<GE extends GlobalEntityKey = GlobalEntityKey>
  extends UseFormFieldsStandardLayoutReturn<GE> {
  fieldContextCache: Ref<Map<string, FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GE>[]>
  /** One entity per composable instance; map keys are string(fieldKey). */
  getFieldContext: (
    fieldKey: GlobalFieldKey<GE>
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>> | undefined

  getBlockShapeProperties: () => { composable: boolean; canHaveParts: boolean }
  shouldShowPartInstances: Ref<boolean>

  categorizeFieldsByLayout: (fields: GlobalFieldKey<GE>[]) => FieldsByLayout
  getReadyFields: (fields: GlobalFieldKey<GE>[]) => GlobalFieldKey<GE>[]
}
