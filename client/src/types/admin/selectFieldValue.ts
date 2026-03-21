import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { SelectOption } from '@/composables/useSelectOptions'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

import type { UseSelectFilteringReturn } from '@/types/admin/selectFiltering'
export interface UseSelectFieldValueOptions {
  rawFieldValue: ReadonlyVueRef<unknown>
  isMultiple: ComputedRef<boolean>
  options: ReadonlyVueRef<SelectOption[]>
  selectFiltering?: UseSelectFilteringReturn
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  isAnnotationAssignmentSelect?: ComputedRef<boolean>
}

export interface UseSelectFieldValueReturn {
  fieldValue: ComputedRef<string | string[] | null>
}
