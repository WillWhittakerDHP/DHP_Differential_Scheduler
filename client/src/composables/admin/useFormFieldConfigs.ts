import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { getFieldKeys } from '@/utils/forms/getFieldKeys'

/**
 * Shared form field config computeds (fieldKeys, instanceConfig, inline/stacked).
 * WHY: Deduplicates identical computed blocks from DynamicForm.vue and EntityFormContent.vue.
 */
export function useFormFieldConfigs(
  entityKey: GlobalEntityKey,
  entity: Ref<unknown>,
  fieldMetadata: Ref<Record<string, FieldMetadataEntry> | null | undefined>
) {
  const adminConfig = useAdminConfig()

  const fieldKeys = computed(() =>
    getFieldKeys({
      entity: (entity.value ?? null) as Record<string, unknown> | null,
      fieldMetadata: fieldMetadata.value ?? undefined,
      entityKey,
    })
  )

  const instanceConfig = computed(() => {
    const v = adminConfig.getInstanceConfig(entityKey).value
    return v !== undefined && v !== null ? v : {}
  })

  const inlineFieldsConfig = computed(() => {
    const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    const raw = config?.inlineFields
    return (raw !== undefined && raw !== null ? raw : []) as GlobalFieldKey<GlobalEntityKey>[]
  })

  const stackedFieldsConfig = computed(() => {
    const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    const raw = config?.stackedFields
    return (raw !== undefined && raw !== null ? raw : []) as GlobalFieldKey<GlobalEntityKey>[]
  })

  return {
    fieldKeys,
    instanceConfig,
    inlineFieldsConfig,
    stackedFieldsConfig,
  }
}
