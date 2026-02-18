import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import type { FieldContextType } from '@/composables/useFieldContext'
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { FieldsByLayout } from '@/utils/forms/layoutFieldCategorization'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

export interface UseFormFieldsOptions {
  entityKey: GlobalEntityKey
  entityId: Ref<GlobalEntityId>
  form?: Ref<FormContext | undefined>
  fieldKeys: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  /**
   * LEARNING: Metadata is the source of truth for field rendering (labels/required/renderAs/inputConfig)
   * WHY: Removes reliance on legacy adminConfig formFieldConfig for rendering decisions
   * PATTERN: Pass the already-fetched metadata (EntityCard fetches it once) to avoid duplicate queries
   */
  fieldMetadata?: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  inlineFieldsConfig?: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig?: Ref<GlobalFieldKey<GlobalEntityKey>[]> | ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  adminConfig?: ReturnType<typeof useAdminConfig>
}

export interface UseFormFieldsReturn {
  fieldContextCache: Ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  getFieldContext: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ) => FieldContextType<GE, FieldKey> | undefined

  getBlockShapeProperties: () => { composable: boolean; canHaveParts: boolean }
  shouldShowPartInstances: Ref<boolean>

  categorizeFieldsByLayout: (fields: GlobalFieldKey<GlobalEntityKey>[]) => FieldsByLayout
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]

  inlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}


