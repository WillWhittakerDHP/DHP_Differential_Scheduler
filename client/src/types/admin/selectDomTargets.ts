import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'
import type { SelectGroup } from '@/types/entity/selectOptions'

export interface UseSelectDomTargetsOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  shouldUseMultipleSelects: ComputedRef<boolean>
  groupedByKey: ComputedRef<SelectGroup[]>
}

export interface UseSelectDomTargetsReturn {
  selectDomTargets: ComputedRef<SelectDomTarget[]>
}
