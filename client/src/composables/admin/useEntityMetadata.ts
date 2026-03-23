/**
 * WHY: Unified Entity Metadata Composable
WHY: Single composable for all entity...
 */
import type { ComputedRef } from 'vue'
import { computed, unref, type MaybeRef } from 'vue'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { resolveEntityFieldMetadataRecord } from '@/utils/admin/resolveEntityFieldMetadataRecord'

export interface UseEntityMetadataReturn<_GE extends GlobalEntityKey> {
  fieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refetch: () => Promise<void>
}

export interface UseEntityMetadataOptions {
  /**
   * When set (e.g. useFormFields threads parent metadata), fieldMetadata tracks this ref only;
   * cache resolution by entity is skipped for that record shape.
   */
  fieldMetadataOverride?: ComputedRef<Record<string, FieldMetadataEntry>>
}

export function useEntityMetadata<GE extends GlobalEntityKey>(
  entityKey: GE,
  entity: MaybeRef<GlobalEntity<GE> | null>,
  options?: UseEntityMetadataOptions
): UseEntityMetadataReturn<GE> {
  const entityValue = computed(() => unref(entity))
  const override = options?.fieldMetadataOverride

  const metadataCache = override === undefined ? useMetadataCache() : null

  const fieldMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
    if (override) {
      return override.value
    }
    if (!metadataCache) {
      return {}
    }
    return resolveEntityFieldMetadataRecord(entityKey, entityValue.value, metadataCache.metadataData.value)
  })

  return {
    fieldMetadata,

    /**
Loading state from metadata cache
     */
    isLoading: computed(() => (override ? false : (metadataCache?.isLoading.value ?? false))),

    /**
Error from metadata cache
WHY: Reflects actual error state from meta...
     */
    error: computed(() => (override ? null : (metadataCache?.error.value ?? null))),

    refetch: () => Promise.resolve(),
  }
}
