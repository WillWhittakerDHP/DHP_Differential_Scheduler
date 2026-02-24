/**
 * PATTERN: EntityCard form + computed + field configuration in one composable.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { AdminConfig } from '@/configs/adminConfig'
import { useEntityCardComputed } from '@/composables/admin/useEntityCardComputed'
import { useEntityCardFieldConfiguration } from '@/composables/admin/useEntityCardFieldConfiguration'
import { useFormFields } from '@/composables/useFormFields'

export interface UseEntityCardFormSetupParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
  isExpanded: ComputedRef<boolean>
  filteredMetadata?: Record<string, FieldMetadataEntry>
  form: Ref<FormContext | undefined>
  adminConfig: AdminConfig
}

export interface UseEntityCardFormSetupReturn {
  formFields: ReturnType<typeof useFormFields>
  fieldKeys: ComputedRef<import('@/constants/primitives').GlobalFieldKey<GlobalEntityKey>[]>
  isMetadataReady: ComputedRef<boolean>
  entityName: ComputedRef<string>
  isComposable: ComputedRef<boolean>
  finalFieldKeys: ComputedRef<import('@/constants/primitives').GlobalFieldKey<GlobalEntityKey>[]>
  fieldLocation: ReturnType<typeof useEntityCardFieldConfiguration>['fieldLocation']
  inlineFieldsConfig: ComputedRef<import('@/constants/primitives').GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: ComputedRef<import('@/constants/primitives').GlobalFieldKey<GlobalEntityKey>[]>
  isFormReady: ComputedRef<boolean>
}

export function useEntityCardFormSetup<GE extends GlobalEntityKey>(
  params: UseEntityCardFormSetupParams<GE>
): UseEntityCardFormSetupReturn {
  const {
    entityKey,
    entity,
    composedFieldMetadata,
    isMetadataLoading,
    isExpanded,
    filteredMetadata,
    form,
    adminConfig,
  } = params

  const { fieldKeys, isMetadataReady, entityName, isComposable } = useEntityCardComputed({
    entityKey,
    entity,
    composedFieldMetadata,
    isMetadataLoading,
  })

  const {
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig,
  } = useEntityCardFieldConfiguration({
    entityKey,
    fieldKeys,
    composedFieldMetadata,
    isExpanded,
    filteredMetadata,
  })

  const formFields = useFormFields({
    entityKey,
    entityId: computed(() => entity.id),
    form,
    fieldKeys: finalFieldKeys,
    fieldMetadata: composedFieldMetadata,
    inlineFieldsConfig,
    stackedFieldsConfig,
    adminConfig,
  })

  const isFormReady = computed(() => formFields.isFormReady.value)

  return {
    formFields,
    fieldKeys,
    isMetadataReady,
    entityName,
    isComposable,
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig,
    isFormReady,
  }
}
