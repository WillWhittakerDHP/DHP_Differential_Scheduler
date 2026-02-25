/**
 * PATTERN: EntityCard form + computed + field configuration in one composable.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useEntityCardComputed } from '@/composables/admin/useEntityCardComputed'
import { useEntityCardFieldConfiguration } from '@/composables/admin/useEntityCardFieldConfiguration'
import { useFormFields } from '@/composables/useFormFields'
import type { UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn } from '@/types/admin/entityCardFormSetup'

export type { UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn } from '@/types/admin/entityCardFormSetup'

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
