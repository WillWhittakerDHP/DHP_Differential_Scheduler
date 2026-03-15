import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'

export interface UseSelectDomTargetsOptions {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

export interface UseSelectDomTargetsReturn {
  selectDomTargets: ComputedRef<SelectDomTarget[]>
}
