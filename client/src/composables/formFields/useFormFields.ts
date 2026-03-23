import { computed, unref } from 'vue'
import { categorizeFieldsByLayout as categorizeFieldsByLayoutPure } from '@/utils/forms/layoutFieldCategorization'
import { asEmptyArray } from '@/utils/safeDefaults'
import type { UseFormFieldsOptions, UseFormFieldsReturn } from './types'
import { useFormFieldsStandardLayout } from './useFormFieldsStandardLayout'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { readFieldKeysFromOptionalConfigRef, readGlobalFieldKeyArray } from '@/utils/formFields/readFormFieldKeySources'
import { getBlockInstanceShapeProperties } from '@/utils/admin/blockInstanceShape'
import { buildUseFormFieldsReturn } from '@/utils/formFields/buildUseFormFieldsReturn'
import { useFormFieldsFieldContextSetup } from '@/utils/formFields/useFormFieldsFieldContextSetup'

/**
 * Orchestrates form field setup for entity forms: options, context, and layout (inline/stacked).
 *
 * CONSUMERS (composable-health wave 3): useEntityCardFormSetup (→ EntityCard), EntityFormContent.vue,
 * DynamicForm.vue. Type UseFormFieldsReturn is consumed by entityCardFieldContextAndVisibility.ts.
 *
 * Generic GE matches the card’s entityKey so field contexts and cache entries share one entity type.
 */
export function useFormFields<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseFormFieldsOptions<GE>
): UseFormFieldsReturn<GE> {
  const { entityKey, entityId, fieldMetadata: providedFieldMetadata, adminConfig: providedAdminConfig } = options

  const fieldKeysSource = computed((): GlobalFieldKey<GE>[] =>
    readGlobalFieldKeyArray<GE>(options.fieldKeys.value)
  )
  const inlineFieldsSource = computed((): GlobalFieldKey<GE>[] =>
    readFieldKeysFromOptionalConfigRef<GE>(options.inlineFieldsConfig)
  )
  const stackedFieldsSource = computed((): GlobalFieldKey<GE>[] =>
    readFieldKeysFromOptionalConfigRef<GE>(options.stackedFieldsConfig)
  )

  const _resolvedAdminConfig = providedAdminConfig ?? useAdminConfig()
  void _resolvedAdminConfig
  const fieldSetup = useFormFieldsFieldContextSetup<GE>(
    {
      entityKey,
      fieldKeysSource,
      providedForm: options.form,
      providedFieldMetadata,
    },
    entityId
  )

  const { fieldContextCache, isFormReady, fieldsNeedingContexts, getFieldContext, currentEntityId } = fieldSetup

  const adminComp = useAdmin()

  const getReadyFields = (fields: GlobalFieldKey<GE>[]): GlobalFieldKey<GE>[] => {
    return fields.filter((fieldKey) => {
      const hasContext = !!getFieldContext(fieldKey)
      const fieldKeyStr = String(fieldKey)
      const hasMetadata =
        providedFieldMetadata !== undefined && fieldKeyStr in unref(providedFieldMetadata)
      return hasContext && hasMetadata
    })
  }

  const categorizeFieldsByLayout = (fields: GlobalFieldKey<GE>[]) => {
    return categorizeFieldsByLayoutPure(
      fields.map(String),
      asEmptyArray(inlineFieldsSource.value).map(String),
      asEmptyArray(stackedFieldsSource.value).map(String)
    )
  }

  const standardLayout = useFormFieldsStandardLayout<GE>({
    fieldKeys: fieldKeysSource,
    inlineFieldsConfig: inlineFieldsSource,
    stackedFieldsConfig: stackedFieldsSource,
    getReadyFields,
  })

  const getBlockShapeProperties = (): { composable: boolean; canHaveParts: boolean } => {
    if (entityKey !== 'blockInstance') {
      return { composable: false, canHaveParts: false }
    }
    return getBlockInstanceShapeProperties(adminComp, currentEntityId.value)
  }

  const shouldShowPartInstances = computed(() => {
    if (entityKey !== 'blockInstance') return false
    return getBlockShapeProperties().canHaveParts
  })

  return buildUseFormFieldsReturn({
    fieldContextCache,
    isFormReady,
    fieldsNeedingContexts,
    getFieldContext,
    getBlockShapeProperties,
    shouldShowPartInstances,
    categorizeFieldsByLayout,
    getReadyFields,
    standardLayout,
  })
}
