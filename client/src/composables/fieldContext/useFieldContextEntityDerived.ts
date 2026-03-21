import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { asEmptyString } from '@/utils/safeDefaults'
import type { useComponentEntity } from '@/composables/useComponentEntity'

export interface UseFieldContextEntityDerivedParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  entityKey: GE
  fieldKey: FieldKey
  entityId: GlobalEntityId
  isTempEntity: ComputedRef<boolean>
  entity: ComputedRef<unknown>
  composedEntityComposable: ReturnType<typeof useComponentEntity> | null
}

export interface UseFieldContextEntityDerivedReturn {
  entityValue: ComputedRef<ValidAdminValue>
  actualPropertyName: ComputedRef<string>
}

/**
 * Derived entity value and property name for field context.
 * Extracted from useFieldContextState to reduce composables-logic complexity (score below 20).
 */
export function useFieldContextEntityDerived<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: UseFieldContextEntityDerivedParams<GE, FieldKey>
): UseFieldContextEntityDerivedReturn {
  const { entityKey, fieldKey, entityId, isTempEntity, entity, composedEntityComposable } = params

  const entityForMetadata = computed(() => {
    const entityValue = entity.value
    if (!entityValue) return null
    return entityValue as GlobalEntity<GE>
  })

  const { fieldMetadata } = useEntityMetadata(entityKey, entityForMetadata)

  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) return undefined
    return fieldMetadata.value[String(fieldKey)]
  })

  const actualPropertyName = computed(() => {
    const metadata = fieldMetadataEntry.value
    if (metadata?.inputConfig && typeof metadata.inputConfig === 'object') {
      const inputConfig = metadata.inputConfig as Record<string, unknown>
      if (inputConfig.globalField && typeof inputConfig.globalField === 'string') {
        return inputConfig.globalField
      }
    }
    return String(fieldKey)
  })

  const entityValue = computed<ValidAdminValue>(() => {
    if (isTempEntity.value) return ''

    if (composedEntityComposable) {
      const components = composedEntityComposable.data.getComponents(entityId)
      return components.map((ea) => ea.childId) as unknown as ValidAdminValue
    }

    const currentEntity = entity.value as Record<string, unknown> | undefined
    if (!currentEntity) return ''

    const propertyName = actualPropertyName.value
    if (Object.prototype.hasOwnProperty.call(currentEntity, propertyName)) {
      const propValue = (currentEntity as Record<string, unknown>)[propertyName]
      if (propValue == null) return '' as ValidAdminValue
      return asEmptyString(propValue as string) as ValidAdminValue
    }
    return ''
  })

  return { entityValue, actualPropertyName }
}
