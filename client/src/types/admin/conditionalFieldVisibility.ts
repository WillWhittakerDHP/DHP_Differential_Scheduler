import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FormContext } from 'vee-validate'

export interface FieldsByLocation {
  titleRow: GlobalFieldKey<GlobalEntityKey>[]
  directInline: GlobalFieldKey<GlobalEntityKey>[]
  directStacked: GlobalFieldKey<GlobalEntityKey>[]
  subPanels: SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>
  hidden: GlobalFieldKey<GlobalEntityKey>[]
}

export interface UseConditionalFieldVisibilityOptions {
  fieldsByLocation: ComputedRef<FieldsByLocation>
  entityKey: GlobalEntityKey
  isComposable: ComputedRef<boolean>
  form: FormContext
}

export interface UseConditionalFieldVisibilityReturn {
  filteredFieldsByLocation: ComputedRef<FieldsByLocation>
}
