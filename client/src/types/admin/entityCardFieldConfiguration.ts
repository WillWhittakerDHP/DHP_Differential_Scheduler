import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { UseFieldLocationReturn } from '@/types/admin/fieldLocation'

export interface UseEntityCardFieldConfigurationParams<GE extends GlobalEntityKey = GlobalEntityKey> {
  entityKey: GE
  fieldKeys: ComputedRef<GlobalFieldKey<GE>[]>
  composedFieldMetadata: ComputedRef<Record<string, FieldMetadataEntry>>
  isExpanded: ComputedRef<boolean>
  filteredMetadata?: Record<string, FieldMetadataEntry>
}

export interface UseEntityCardFieldConfigurationReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  finalFieldKeys: ComputedRef<GlobalFieldKey<GE>[]>
  fieldLocation: UseFieldLocationReturn<GE>
  inlineFieldsConfig: ComputedRef<GlobalFieldKey<GE>[]>
  stackedFieldsConfig: ComputedRef<GlobalFieldKey<GE>[]>
}
