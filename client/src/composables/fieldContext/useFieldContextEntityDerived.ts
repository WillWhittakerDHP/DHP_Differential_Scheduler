import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'
import { computeFieldContextEntityValues } from '@/utils/fieldContext/computeFieldContextEntityValues'

export type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'

export interface UseFieldContextEntityDerivedParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  entityKey: GE
  fieldKey: FieldKey
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  entity: ComputedRef<unknown>
  composedEntityComposable: ComposedEntityLike | null
  /** Threaded from useFormFields → skips cache-shaped resolution inside useEntityMetadata. */
  fieldMetadata?: ComputedRef<Record<string, FieldMetadataEntry>>
}

/**
 * Derived entity value and property name for field context.
 * Extracted from useFieldContextState to reduce composables-logic complexity (score below 20).
 */
export function useFieldContextEntityDerived<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: UseFieldContextEntityDerivedParams<GE, FieldKey>
): UseFieldContextEntityDerivedReturn {
  const { entityKey, fieldKey, entityId, isTempEntity, entity, composedEntityComposable, fieldMetadata: injectedFieldMetadata } =
    params

  const entityForMetadata = computed(() => {
    const entityValue = entity.value
    if (!entityValue) return null
    return entityValue as GlobalEntity<GE>
  })

  const { fieldMetadata } = useEntityMetadata(
    entityKey,
    entityForMetadata,
    injectedFieldMetadata !== undefined ? { fieldMetadataOverride: injectedFieldMetadata } : undefined
  )

  return computeFieldContextEntityValues({
    entityKey, fieldKey, entityId, isTempEntity, entity, composedEntityComposable, fieldMetadata,
  })
}
