import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FormContext } from 'vee-validate'
import type { Ref } from 'vue'

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
  /** When false, blockInstance `semanticType` (user-role) field is hidden. */
  isUserSemanticBlockInstance?: ComputedRef<boolean> | Ref<boolean>
}

export interface UseConditionalFieldVisibilityReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  filteredFieldsByLocation: ComputedRef<FieldsByLocation<GE>>
}
