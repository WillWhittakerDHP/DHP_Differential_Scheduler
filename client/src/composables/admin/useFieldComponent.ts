/**
 * WHY: Field Component Composable

 */
import { computed } from 'vue'
import { useEntityMetadata } from './useEntityMetadata'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import {
  resolveComponentTypeFromFieldContext,
  resolveProvidedEntity,
  unwrapMaybeRefKey,
} from '@/utils/forms/fieldComponentResolve'
import type { UseFieldComponentOptions, UseFieldComponentReturn } from '@/types/admin/fieldComponent'

/**
 * WHY: Field Component Composable

WHY: Wraps pure dispatcher function for Vue ...
 */
export function useFieldComponent(options: UseFieldComponentOptions): UseFieldComponentReturn {
  const { entityKey, fieldKey, entity: providedEntity, fieldMetadata: providedFieldMetadata } = options

  const entityKeyRef = computed(() => unwrapMaybeRefKey(entityKey))

  const fieldKeyRef = computed(() => unwrapMaybeRefKey(fieldKey))

  const entity = computed(() => resolveProvidedEntity(providedEntity))

  const fetchedFieldMetadata = useEntityMetadata(
    entityKeyRef.value ?? 'blockInstance',
    entity
  )

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

  const componentType = computed(() =>
    resolveComponentTypeFromFieldContext({
      entityKey: entityKeyRef.value,
      fieldKey: fieldKeyRef.value,
      fieldMetadataEntry: fieldMetadataEntry.value,
    })
  )

  return {
    componentType,
    fieldMetadataEntry,
  }
}
