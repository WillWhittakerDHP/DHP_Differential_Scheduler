import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

export interface UseEntityCardComputedParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entity: GlobalEntity<GE>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isMetadataLoading: ComputedRef<boolean>
}

export interface UseEntityCardComputedReturn {
  fieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  isMetadataReady: ComputedRef<boolean>
  entityName: ComputedRef<string>
  isComposable: ComputedRef<boolean>
}
