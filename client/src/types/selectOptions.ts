import type { Ref } from 'vue'
import type { useAdmin } from '@/composables/admin/useAdmin'
import type { SelectGroup } from '@/types/entity/selectOptions'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'

/** Sentinel value for option-list group headers (non-selectable row showing block shape name). */
const SELECT_OPTION_GROUP_HEADER_VALUE_CORE = '__select_group_header__'

export const SELECT_OPTION_GROUP_HEADER_VALUE = SELECT_OPTION_GROUP_HEADER_VALUE_CORE

export interface SelectOptionBase {
  title: string
  value: string
}

export interface SelectOption extends SelectOptionBase {
  children?: SelectOption[]
}

/** Non-selectable row in the options list used as a group label (e.g. block shape name). */
export interface SelectOptionGroupHeader {
  header: string
  title: string
  value: typeof SELECT_OPTION_GROUP_HEADER_VALUE_CORE
}

export type SelectOptionOrHeader = SelectOption | SelectOptionGroupHeader

export function isSelectOptionGroupHeader(
  item: SelectOptionOrHeader
): item is SelectOptionGroupHeader {
  return (item as SelectOptionGroupHeader).value === SELECT_OPTION_GROUP_HEADER_VALUE_CORE
}

export interface GroupedEntities extends SelectGroup {
  entities: GlobalEntity<GlobalEntityKey>[]
}

export interface UseSelectOptionsOptions {
  filteredEntities: Ref<GlobalEntity<GlobalEntityKey>[]>
  selectConfig: Ref<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  optionLabelKey: Ref<string>
  isMultiple: Ref<boolean>
  rawFieldValue: Ref<unknown>
  fieldKey?: Ref<string>
  adminComp?: ReturnType<typeof useAdmin>
}

export interface UseSelectOptionsReturn {
  options: Ref<SelectOptionOrHeader[]>
  normalizedValue: Ref<string | string[] | null>
}
