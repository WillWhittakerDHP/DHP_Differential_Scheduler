/**
 * PATTERN: Composable for managing field ordering in metadata editor

Used by:
- Ad...
 */
import { ref, computed, watch } from 'vue'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'
import { asEmptyObject } from '@/utils/safeDefaults'
import type { UseMetadataFieldOrderingOptions, UseMetadataFieldOrderingReturn } from '@/types/admin/metadataFieldOrdering'


export function useMetadataFieldOrdering(
  options: UseMetadataFieldOrderingOptions
): UseMetadataFieldOrderingReturn {
  const { fieldMetadata, getFieldMetadata, updateFieldRendering } = options

  // PATTERN: Use metadata keys exclusively
  const allPossibleFieldKeys = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    if (!fieldMetadata.value || Object.keys(fieldMetadata.value).length === 0) {
      return []
    }
    return Object.keys(fieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
  })

  // PATTERN: Sort by displayOrder, then alphabetically for fields without order. Coerce to string for Map/API compatibility.
  const availableFieldsSorted = computed<string[]>(() => {
    const metadataKeys = Object.keys(asEmptyObject(fieldMetadata.value))
    const allKeys = new Set([...allPossibleFieldKeys.value.map(String), ...metadataKeys])
    const fields = Array.from(allKeys)
    
    return fields.sort((a, b) => {
      const metaA = getFieldMetadata(a)
      const metaB = getFieldMetadata(b)
      const orderA = metaA?.displayOrder ?? 999
      const orderB = metaB?.displayOrder ?? 999
      
      if (orderA !== orderB) {
        return orderA - orderB
      }
      
      return a.localeCompare(b)
    })
  })

  // PATTERN: Ref array that syncs with computed sorted fields
  const draggableFieldKeys = ref<string[]>([])

  // PATTERN: Watch computed and update ref array
  watch(availableFieldsSorted, (newFields) => {
    draggableFieldKeys.value = newFields.map(String)
  }, { immediate: true })

  // PATTERN: Normalize displayOrder to sequential values (0, 1, 2, ...)
  function handleDragEnd(): void {
    draggableFieldKeys.value.forEach((fieldKey, index) => {
      const currentMeta = getFieldMetadata(fieldKey)
      const currentOrder = currentMeta?.displayOrder ?? 999
      
      if (currentOrder !== index) {
        updateFieldRendering(fieldKey, { displayOrder: index })
      }
    })
  }

  return {
    availableFieldsSorted,
    draggableFieldKeys,
    handleDragEnd,
  }
}
