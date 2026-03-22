import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FormContext } from 'vee-validate'

export type FieldsByLocation<GE extends GlobalEntityKey = GlobalEntityKey> = {
  titleRow: GlobalFieldKey<GE>[]
  directInline: GlobalFieldKey<GE>[]
  directStacked: GlobalFieldKey<GE>[]
  subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
  hidden: GlobalFieldKey<GE>[]
}

export interface UseConditionalFieldVisibilityOptions<GE extends GlobalEntityKey = GlobalEntityKey> {
  fieldsByLocation: ComputedRef<FieldsByLocation<GE>>
  entityKey: GE
  isComposable: ComputedRef<boolean>
  form: FormContext
}

export interface UseConditionalFieldVisibilityReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  filteredFieldsByLocation: ComputedRef<FieldsByLocation<GE>>
}
