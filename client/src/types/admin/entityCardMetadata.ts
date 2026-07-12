import type { ComputedRef, MaybeRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface UseEntityMetadataReturn {
  fieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null | unknown>
  refetch: () => Promise<void>
}

export interface UseEntityCardMetadataParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: MaybeRef<GlobalEntity<GE>>
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardMetadataReturn {
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
  fetchedMetadata: UseEntityMetadataReturn
}
