import type { GlobalEntityKey } from '@/constants/entities'
import type { RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'

export type SelectConfigLike =
  | RelationshipFieldType<GlobalEntityKey>
  | VirtualFieldType<GlobalEntityKey>

export interface OptionsSelectConfigLike {
  options: Array<{ value: string | null; label: string }>
  selectMode?: RelationshipSelectModeEnum
}
