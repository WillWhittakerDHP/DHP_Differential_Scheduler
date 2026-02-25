import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { SelectOption } from '@/composables/useSelectOptions'
import type { UseSelectFilteringReturn } from '@/composables/admin/useSelectFiltering'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectFieldValueOptions {
  rawFieldValue: ReadonlyVueRef<unknown>
  isMultiple: ComputedRef<boolean>
  options: ReadonlyVueRef<SelectOption[]>
  selectFiltering?: UseSelectFilteringReturn
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  isAnnotationAssignmentSelect?: ComputedRef<boolean>
}

export interface UseSelectFieldValueReturn {
  fieldValue: ComputedRef<string | string[] | null>
}
