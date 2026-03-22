/**
 * PATTERN: EntityCard form + computed + field configuration in one composable.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 * Wave 4: useEntityCardComputed inlined here to reduce composable chain depth.
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { entityDisplay } from '@/utils/admin/entityDisplay'
import { useInstanceShape } from '@/composables/admin/useInstanceShape'
import { useEntityCardFieldConfiguration } from '@/composables/admin/useEntityCardFieldConfiguration'
import { useFormFields } from '@/composables/useFormFields'
import type { UseEntityCardFormSetupParams, UseEntityCardFormSetupReturn } from '@/types/admin/entityCardFormSetup'

export function useEntityCardFormSetup<GE extends GlobalEntityKey>(
  params: UseEntityCardFormSetupParams<GE>
): UseEntityCardFormSetupReturn<GE> {
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

  const { getEntityName } = entityDisplay(useAdminConfig())

  const instanceShape =
    entityKey === 'blockInstance'
      ? useInstanceShape({
          entityKey: 'blockInstance',
          entityId: computed(() => entity.id),
        })
      : null

  const isMetadataReady = computed(() => {
    const isLoading = isMetadataLoading.value
    const metadata = composedFieldMetadata.value
    return !isLoading && metadata !== undefined && Object.keys(metadata).length >= 0
  })

  const fieldKeys = computed(() => {
    if (composedFieldMetadata.value && Object.keys(composedFieldMetadata.value).length > 0) {
      return Object.keys(composedFieldMetadata.value) as GlobalFieldKey<GE>[]
    }
    return [] as GlobalFieldKey<GE>[]
  })

  const entityName = computed(() => getEntityName(entityKey, entity))

  const isComposable = computed(() => {
    if (entityKey !== 'blockInstance') return false
    return instanceShape?.blockShape.value?.composable === true
  })

  const {
    finalFieldKeys,
    fieldLocation,
    inlineFieldsConfig,
    stackedFieldsConfig,
  } = useEntityCardFieldConfiguration<GE>({
    entityKey,
    fieldKeys,
    composedFieldMetadata,
    isExpanded,
    filteredMetadata,
  })

  const formFields = useFormFields<GE>({
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
