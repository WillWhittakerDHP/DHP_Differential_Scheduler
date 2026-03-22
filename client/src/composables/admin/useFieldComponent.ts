/**
 * WHY: Field Component Composable

 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { useEntityMetadata } from './useEntityMetadata'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { getFieldComponent } from '@/utils/forms/fieldComponentDispatcher'
import { createLogger } from '@/utils/logger'
import type { UseFieldComponentOptions, UseFieldComponentReturn } from '@/types/admin/fieldComponent'

const logger = createLogger('useFieldComponent')

/**
 * WHY: Field Component Composable

WHY: Wraps pure dispatcher function for Vue ...
 */
export function useFieldComponent(
  options: UseFieldComponentOptions
): UseFieldComponentReturn {
  const { entityKey, fieldKey, entity: providedEntity, fieldMetadata: providedFieldMetadata } = options
  
  const entityKeyRef = computed(() => {
    return entityKey instanceof Object && 'value' in entityKey ? entityKey.value : entityKey
  })
  
  const fieldKeyRef = computed(() => {
    return fieldKey instanceof Object && 'value' in fieldKey ? fieldKey.value : fieldKey
  })

  const entity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
    if (!providedEntity) {
      return null
    }
    if ('value' in providedEntity && typeof providedEntity.value === 'object') {
      return providedEntity.value as GlobalEntity<GlobalEntityKey> | null
    }
    return providedEntity as GlobalEntity<GlobalEntityKey> | null
  })

  /**
   * FIX: Pass reactive entityKeyRef instead of dereferenced value to ensure reactivity
   */
  const fetchedFieldMetadata = useEntityMetadata(
    entityKeyRef.value ?? 'blockInstance', // Default to blockInstance if undefined
    entity
  )

  // PATTERN: Parent may omit fieldMetadata (undefined) so we fetch from useEntityMetadata.
  const fieldMetadata = computed(() => {
    if (providedFieldMetadata !== undefined) {
      const v = providedFieldMetadata.value
      if (v !== undefined && v !== null) {
        return v
      }
    }
    return fetchedFieldMetadata.fieldMetadata.value
  })

  const fieldMetadataEntry = computed<FieldMetadataEntry | undefined>(() => {
    if (!fieldKeyRef.value || !fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldKeyRef.value)]
  })

  const componentType = computed(() => {
    if (!fieldKeyRef.value) {
      const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
      // Only warn when context is partially set (suggests a bug). When both are undefined, skip to avoid console spam during mount/transient state.
      if (entityKeyRef.value !== undefined && entityKeyRef.value !== null) {
        logger.warn('Unknown component type - missing fieldKey', {
          entityKey: entityKeyRef.value,
          fieldKey: fieldKeyRef.value,
          fieldMetadataEntry: fieldMetadataEntry.value,
          reason: result.reason
        })
      }
      return result
    }
    if (!entityKeyRef.value) {
      const result = { type: 'unknown' as const, reason: 'notConfigured' as const }
      logger.warn('Unknown component type - missing entityKey', {
        entityKey: entityKeyRef.value,
        fieldKey: fieldKeyRef.value,
        fieldMetadataEntry: fieldMetadataEntry.value,
        reason: result.reason
      })
      return result
    }
    const result = getFieldComponent(entityKeyRef.value, fieldKeyRef.value, fieldMetadataEntry.value)
    if (result.type === 'unknown') {
      logger.warn('Unknown component type determined', {
        entityKey: entityKeyRef.value,
        fieldKey: fieldKeyRef.value,
        fieldMetadataEntry: fieldMetadataEntry.value,
        componentType: result.type,
        reason: result.reason
      })
    }
    return result
  })
  
  return {
    componentType,
    fieldMetadataEntry
  }
}
