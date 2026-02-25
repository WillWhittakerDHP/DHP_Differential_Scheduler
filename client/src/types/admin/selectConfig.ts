import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { SelectOption } from '@/composables/useSelectOptions'

export interface UseSelectConfigOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

export interface UseSelectConfigReturn {
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  isEnumSelect: ComputedRef<boolean>
  isOptionsSelect: ComputedRef<boolean>
  optionsSelectOptions: ComputedRef<SelectOption[]>
  isAnnotationAssignmentSelect: ComputedRef<boolean>
  isAttendeeSelect: ComputedRef<boolean>
  isMultiple: ComputedRef<boolean>
  chipsProps: ComputedRef<Record<string, unknown>>
  optionEntityKey: ComputedRef<GlobalEntityKey>
  optionLabelKey: ComputedRef<string>
}
