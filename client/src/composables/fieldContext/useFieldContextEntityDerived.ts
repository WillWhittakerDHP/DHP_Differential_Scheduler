import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { resolveActualPropertyNameFromFieldMetadata } from '@/utils/fieldContext/fieldMetadataPropertyResolve'
import { readValidAdminValueFromEntityRecord } from '@/utils/fieldContext/resolveEntityFieldValue'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'

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

  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) return undefined
    return fieldMetadata.value[String(fieldKey)]
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
