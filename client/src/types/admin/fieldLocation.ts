import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldLocation } from '@/utils/forms/fieldLocationDispatcher'

export interface UseFieldLocationOptions<GE extends GlobalEntityKey> {
  fieldKeys: Ref<GlobalFieldKey<GE>[]> | ComputedRef<GlobalFieldKey<GE>[]>
  fieldMetadata: Ref<Record<string, FieldMetadataEntry>> | ComputedRef<Record<string, FieldMetadataEntry>>
  isExpanded: Ref<boolean> | ComputedRef<boolean>
}

export interface UseFieldLocationReturn<GE extends GlobalEntityKey> {
  getFieldLocation: (fieldKey: GlobalFieldKey<GE>) => FieldLocation
  fieldsByLocation: ComputedRef<{
    titleRow: GlobalFieldKey<GE>[]
    directInline: GlobalFieldKey<GE>[]
    directStacked: GlobalFieldKey<GE>[]
    subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
    hidden: GlobalFieldKey<GE>[]
  }>
  titleRowFields: ComputedRef<GlobalFieldKey<GE>[]>
}
