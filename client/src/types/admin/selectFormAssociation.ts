import type { ComputedRef } from 'vue'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'

export interface UseSelectFormAssociationOptions {
  targets: ComputedRef<SelectDomTarget[]>
}
