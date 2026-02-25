import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { UseFieldLocationReturn } from '@/types/admin/fieldLocation'

export interface UseEntityCardFieldConfigurationParams {
  entityKey: GlobalEntityKey
  fieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isExpanded: ComputedRef<boolean>
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardFieldConfigurationReturn {
  finalFieldKeys: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  fieldLocation: UseFieldLocationReturn<GlobalEntityKey>
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GlobalEntityKey>[]>
}
