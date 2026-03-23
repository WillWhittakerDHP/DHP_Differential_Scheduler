import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { resolveActualPropertyNameFromFieldMetadata } from '@/utils/fieldContext/fieldMetadataPropertyResolve'
import { readValidAdminValueFromEntityRecord } from '@/utils/fieldContext/resolveEntityFieldValue'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'

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
  const { entityKey, fieldKey, entityId, isTempEntity, entity, composedEntityComposable, fieldMetadata } = params

  const fieldMetadataEntry = computed(() => {
    const meta = fieldMetadata.value
    if (!meta) return undefined
    return meta[String(fieldKey)]
  })

  const actualPropertyName = computed(() =>
    resolveActualPropertyNameFromFieldMetadata(String(fieldKey), fieldMetadataEntry.value)
  )

  const entityValue = computed<ValidAdminValue>(() => {
    if (isTempEntity.value) return ''

    if (composedEntityComposable) {
      const components = composedEntityComposable.data.getComponents(entityId)
      return components.map((ea) => ea.childId) as ValidAdminValue
    }

    const currentEntity = entity.value as Record<string, unknown> | undefined
    return readValidAdminValueFromEntityRecord(entityKey, actualPropertyName.value, currentEntity)
  })

  return { entityValue, actualPropertyName }
}
