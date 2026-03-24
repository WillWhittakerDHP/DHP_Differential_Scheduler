import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { resolveActualPropertyNameFromFieldMetadata } from '@/utils/fieldContext/fieldMetadataPropertyResolve'
import { readValidAdminValueFromEntityRecord } from '@/utils/fieldContext/resolveEntityFieldValue'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import type { UseFieldContextEntityDerivedReturn } from '@/types/fieldContext/fieldContextEntityDerivedReturn'

export interface ComputeEntityDerivedParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  entityKey: GE
  fieldKey: FieldKey
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  entity: ComputedRef<unknown>
  composedEntityComposable: ComposedEntityLike | null
  fieldMetadata: ComputedRef<Record<string, FieldMetadataEntry> | undefined>
}

/**
 * Shared entity-value derivation used by both useFieldContextEntityDerived (metadata from composable)
 * and useFieldContextEntityDerivedThreaded (metadata threaded from parent).
 */
export function computeFieldContextEntityValues<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: ComputeEntityDerivedParams<GE, FieldKey>
): UseFieldContextEntityDerivedReturn {
  const { entityKey, fieldKey, entityId, isTempEntity, entity, composedEntityComposable, fieldMetadata } = params

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
