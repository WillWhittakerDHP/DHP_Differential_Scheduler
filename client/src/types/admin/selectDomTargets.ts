import type { ComputedRef } from 'vue'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'

export type UseSelectDomTargetsReturn = {
  selectDomTargets: ComputedRef<SelectDomTarget[]>
}
