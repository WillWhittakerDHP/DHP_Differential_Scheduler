import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { StatusButtonField } from '@/utils/forms/fieldSectionCategorization'

export interface UseStatusButtonFieldsOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  anyEntityForMetadata: ComputedRef<GlobalEntity<GE> | null>
}

export interface UseStatusButtonFieldsReturn<GE extends GlobalEntityKey> {
  statusButtonFields: ComputedRef<Array<Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<GE> }>>
}
