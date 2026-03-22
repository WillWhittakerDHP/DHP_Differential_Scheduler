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
      return components.map((ea) => ea.childId) as ValidAdminValue
    }

    const currentEntity = entity.value as Record<string, unknown> | undefined
    if (!currentEntity) return ''

    const propertyName = actualPropertyName.value

    const missingDefault = (): ValidAdminValue => {
      if (entityKey === 'blockInstance' && propertyName === 'differentialEventRoleOverrides') {
        return {}
      }
      return ''
    }

    if (!Object.prototype.hasOwnProperty.call(currentEntity, propertyName)) {
      return missingDefault()
    }

    const propValue = (currentEntity as Record<string, unknown>)[propertyName]
    if (propValue === null || propValue === undefined) {
      return missingDefault()
    }
    if (Array.isArray(propValue)) {
      return propValue as ValidAdminValue
    }
    if (typeof propValue === 'object') {
      return propValue as ValidAdminValue
    }
    if (typeof propValue === 'boolean' || typeof propValue === 'number') {
      return propValue as ValidAdminValue
    }
    if (typeof propValue === 'string') {
      return asEmptyString(propValue) as ValidAdminValue
    }
    return asEmptyString(String(propValue)) as ValidAdminValue
  })

  return { entityValue, actualPropertyName }
}
