import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { useAdminConfig } from '@/composables/useAdminConfig'
import type { FieldsByLayout } from '@/utils/forms/layoutFieldCategorization'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Form Fields Composable Options
 */
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

/**
 * Form Fields Composable Return Type
 * 
 * LEARNING: Unified return type for ALL entity types
 * WHY: No entity-type-specific code paths - single unified layout mechanism
 * PATTERN: All entities use same field categorization (inline/stacked)
 */
export interface UseFormFieldsReturn {
  // Field context management
  fieldContextCache: Ref<Map<string, FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>>
  isFormReady: ComputedRef<boolean>
  fieldsNeedingContexts: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  getFieldContext: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    fieldKey: FieldKey
  ) => FieldContextType<GE, FieldKey> | undefined

  // BlockShape properties (for blockInstance - still needed for conditional logic)
  getBlockShapeProperties: () => { composable: boolean; constituable: boolean }
  shouldShowPartInstances: Ref<boolean>

  // Field categorization
  categorizeFieldsByLayout: (fields: GlobalFieldKey<GlobalEntityKey>[]) => FieldsByLayout
  getReadyFields: (fields: GlobalFieldKey<GlobalEntityKey>[]) => GlobalFieldKey<GlobalEntityKey>[]

  // Unified field categorization (for ALL entity types)
  inlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}


