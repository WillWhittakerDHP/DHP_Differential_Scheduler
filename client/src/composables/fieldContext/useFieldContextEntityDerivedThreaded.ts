import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'
import { computeFieldContextEntityValues } from '@/utils/fieldContext/computeFieldContextEntityValues'

export interface UseFieldContextEntityDerivedThreadedParams<
  GE extends GlobalEntityKey,
  FieldKey extends GlobalFieldKey<GE>,
> {
  entityKey: GE
  fieldKey: FieldKey
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  entity: ComputedRef<unknown>
  composedEntityComposable: ComposedEntityLike | null
  /** Threaded parent metadata; no useEntityMetadata / useMetadataCache composable chain. */
  fieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
}

/**
 * Entity value derivation when form fields thread metadata from the parent (useFormFields).
 */
export function useFieldContextEntityDerivedThreaded<
  GE extends GlobalEntityKey,
  FieldKey extends GlobalFieldKey<GE>,
>(params: UseFieldContextEntityDerivedThreadedParams<GE, FieldKey>): UseFieldContextEntityDerivedReturn {
  return computeFieldContextEntityValues(params)
}
