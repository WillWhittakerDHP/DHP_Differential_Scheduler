import type { ComputedRef } from 'vue'
import { computed, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { getFieldKeys } from '@/utils/forms/getFieldKeys'

export interface UseFormFieldConfigsReturn {
  fieldKeys: ComputedRef<string[]>
  instanceConfig: ComputedRef<Record<string, unknown>>
  inlineFieldsConfig: ComputedRef<string[]>
  stackedFieldsConfig: ComputedRef<string[]>
}

/**
 * Shared form field config computeds (fieldKeys, instanceConfig, inline/stacked).
 */
export function useFormFieldConfigs(
  entityKey: GlobalEntityKey,
  entity: Ref<unknown>,
  fieldMetadata: Ref<Record<string, FieldMetadataEntry> | null | undefined>
): UseFormFieldConfigsReturn {
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

  const inlineFieldsConfig = computed<string[]>(() => {
    const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    const raw = config?.inlineFields
    const arr = raw !== undefined && raw !== null ? raw : []
    return arr.map((k) => String(k))
  })

  const stackedFieldsConfig = computed<string[]>(() => {
    const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
    const raw = config?.stackedFields
    const arr = raw !== undefined && raw !== null ? raw : []
    return arr.map((k) => String(k))
  })

  return {
    fieldKeys,
    instanceConfig,
    inlineFieldsConfig,
    stackedFieldsConfig,
  } as UseFormFieldConfigsReturn
}
