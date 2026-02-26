import type { Ref } from 'vue'
import type { useAdmin } from '@/composables/admin/useAdmin'
import type { SelectGroup } from '@/types/entity/selectOptions'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'

export interface SelectOptionBase {
  title: string
  value: string
}

export interface SelectOption extends SelectOptionBase {
  children?: SelectOption[]
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
  options: Ref<SelectOption[]>
  groupedByKey: Ref<GroupedEntities[]>
  shouldUseMultipleSelects: Ref<boolean>
  getGroupOptions: (group: GroupedEntities) => SelectOption[]
  getGroupValue: (group: GroupedEntities) => string | string[] | null
  normalizedValue: Ref<string | string[] | null>
}
