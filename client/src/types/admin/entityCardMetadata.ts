import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface UseEntityCardMetadataParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardMetadataReturn {
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
  fetchedMetadata: ReturnType<typeof import('@/composables/admin/useEntityMetadata').useEntityMetadata<GlobalEntityKey>>
}
