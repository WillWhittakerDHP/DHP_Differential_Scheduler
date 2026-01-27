/**
 * LEARNING: Metadata field ordering and drag-and-drop management
 * WHY: Encapsulates display order computation and drag-and-drop reordering logic
 * PATTERN: Composable for managing field ordering in metadata editor
 * 
 * Used by:
 * - AdminPrimitiveMetadataEditor.vue
 */

import { ref, computed, watch, type Ref } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseMetadataFieldOrderingOptions {
  fieldMetadata: Ref<Record<string, FieldMetadataEntry>>
  getFieldMetadata: (fieldKey: string) => FieldMetadataEntry | undefined
  updateFieldRendering: (fieldKey: string, updates: Partial<FieldMetadataEntry>) => void
}

export interface UseMetadataFieldOrderingReturn {
  availableFieldsSorted: Ref<string[]>
  draggableFieldKeys: Ref<string[]>
  handleDragEnd: () => void
}

/**
 * LEARNING: Manage field ordering for metadata editor
 * WHY: Handles sorting by displayOrder and drag-and-drop reordering
 * PATTERN: Computed sorted fields synced with reactive drag-and-drop array
 */
export function useMetadataFieldOrdering(
  options: UseMetadataFieldOrderingOptions
): UseMetadataFieldOrderingReturn {
  const { fieldMetadata, getFieldMetadata, updateFieldRendering } = options

  // LEARNING: Get all possible field keys from metadata ONLY
  // WHY: Metadata is the single source of truth - no fallback to formFieldConfig
  // PATTERN: Use metadata keys exclusively
  const allPossibleFieldKeys = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
    if (!fieldMetadata.value || Object.keys(fieldMetadata.value).length === 0) {
      return []
    }
    return Object.keys(fieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
  })

  // LEARNING: Available fields sorted by displayOrder for drag-and-drop
  // WHY: Fields should be displayed in their configured order, allowing drag-and-drop reordering
  // PATTERN: Sort by displayOrder, then alphabetically for fields without order
  const availableFieldsSorted = computed(() => {
    const metadataKeys = Object.keys(fieldMetadata.value || {})
    const allKeys = new Set([...allPossibleFieldKeys.value, ...metadataKeys])
    const fields = Array.from(allKeys)
    
    // Sort by displayOrder first, then alphabetically
    return fields.sort((a, b) => {
      const metaA = getFieldMetadata(a)
      const metaB = getFieldMetadata(b)
      const orderA = metaA?.displayOrder ?? 999
      const orderB = metaB?.displayOrder ?? 999
      
      if (orderA !== orderB) {
        return orderA - orderB
      }
      
      // If same order, sort alphabetically
      return a.localeCompare(b)
    })
  })

  // LEARNING: Reactive array for drag-and-drop reordering
  // WHY: Need mutable array that can be reordered during drag operations
  // PATTERN: Ref array that syncs with computed sorted fields
  const draggableFieldKeys = ref<string[]>([])

  // LEARNING: Sync draggableFieldKeys with availableFieldsSorted
  // WHY: Keep drag-and-drop array in sync with computed sorted fields
  // PATTERN: Watch computed and update ref array
  watch(availableFieldsSorted, (newFields) => {
    draggableFieldKeys.value = [...newFields]
  }, { immediate: true })

  // LEARNING: Handle drag end to update displayOrder values
  // WHY: When fields are reordered, update displayOrder based on new position
  // PATTERN: Normalize displayOrder to sequential values (0, 1, 2, ...)
  function handleDragEnd(): void {
    // Update displayOrder for each field based on its new position
    draggableFieldKeys.value.forEach((fieldKey, index) => {
      const currentMeta = getFieldMetadata(fieldKey)
      const currentOrder = currentMeta?.displayOrder ?? 999
      
      // Only update if order changed
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
