import type { Ref } from 'vue'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

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
