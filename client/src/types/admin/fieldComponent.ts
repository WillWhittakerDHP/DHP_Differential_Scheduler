import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { FieldComponent } from '@/types/forms/fieldComponent'

export interface UseFieldComponentOptions {
  entityKey: Ref<GlobalEntityKey | undefined> | ComputedRef<GlobalEntityKey | undefined> | GlobalEntityKey | undefined
  fieldKey: Ref<GlobalFieldKey<GlobalEntityKey> | undefined> | ComputedRef<GlobalFieldKey<GlobalEntityKey> | undefined> | GlobalFieldKey<GlobalEntityKey> | undefined
  entity?: Ref<GlobalEntity<GlobalEntityKey> | null> | ComputedRef<GlobalEntity<GlobalEntityKey> | null> | GlobalEntity<GlobalEntityKey> | null
  fieldMetadata?:
    | ComputedRef<Record<string, FieldMetadataEntry> | undefined>
    | Ref<Record<string, FieldMetadataEntry> | undefined>
}

export interface UseFieldComponentReturn {
  componentType: ComputedRef<FieldComponent>
  fieldMetadataEntry: ComputedRef<FieldMetadataEntry | undefined>
}
