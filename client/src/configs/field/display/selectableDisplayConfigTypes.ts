import type { GlobalEntityKey } from '@/constants/entities'
import {
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '@/types/entity/formDataEnums'

type ChildFieldKey =
  | GlobalFieldKey<'blockInstance'>
  | GlobalFieldKey<'partInstance'>
  | GlobalFieldKey<'blockShape'>
  | GlobalFieldKey<'partShape'>
  | GlobalFieldKey<'eventInstance'>

type ValidRelationshipKeys<GE extends GlobalEntityKey> =
  GE extends 'blockShape' ? 'validCascades' | 'validParts' | 'validAnnotations' | 'validEvents' :
  GE extends 'blockInstance'
    ? 'bookingCascades' | 'partAssignments' | 'annotationAssignments' | 'eventAssignments' | 'instanceComponents' | 'dependentInstances'
    : GE extends 'partInstance' ? 'pricingCascades' : GE extends 'partShape' ? 'validPricingCascades' : never

type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE> | ValidRelationshipKeys<GE>

type RelationshipDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey,
  R extends GlobalRelationshipKey = GlobalRelationshipKey
> = {
  targetMode: 'relationship'
  targetKey: R
  globalField: SelectableFieldKey<GE>

  selectedParentKey: GE
  selectedChildKey: GlobalEntityKey
  selectedChildPath: SelectableFieldKey<GE>[]

  candidateParentKey: GlobalEntityKey
  candidateParentPath: SelectableFieldKey<GE>[]
  candidateChildKey: GlobalEntityKey
  candidateChildPath?: SelectableFieldKey<GE>[]

  selectType: RelationshipSelectTypeEnum
  selectMode: RelationshipSelectModeEnum
  groupByKey?: ChildFieldKey

  label: string
  placeholder?: string
  className?: string
  style?: Record<string, string | number>
  tooltip?: string
  inline?: boolean
  stacked?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'

  displayFormat?: 'list' | 'chips' | 'badges' | 'collection' | 'cards'
  emptyStateText?: string
  maxDisplayItems?: number
  showCount?: boolean
  sortBy?: 'name' | typeof FIELD_NAMES.ORDER_INDEX | 'custom'
  sortDirection?: 'asc' | 'desc'

  meta?: {
    visible?: boolean
    required?: boolean
    disabled?: boolean
    groupByKey?: GlobalEntityKey
    defaultSort?: boolean
  }
}

type VirtualDisplayType<GE extends GlobalEntityKey = GlobalEntityKey> = {
  targetMode: 'primitive'
  targetKey: typeof ENTITY_KEY_BLOCK_SHAPE | typeof ENTITY_KEY_PART_SHAPE
  globalField: GlobalFieldKey<GE>

  selectedParentKey: GE
  selectedChildKey: GlobalEntityKey
  selectedChildPath: GlobalFieldKey<GE>[]

  candidateParentKey: GlobalEntityKey
  candidateParentPath: GlobalFieldKey<GE>[]
  candidateChildKey: GlobalEntityKey
  candidateChildPath: GlobalFieldKey<GE>[]

  selectType: TypeSelectEnum
  selectMode: RelationshipSelectModeEnum
  groupByKey?: GlobalFieldKey<GlobalEntityKey>

  label: string
  placeholder?: string
  className?: string
  style?: Record<string, string | number>
  tooltip?: string
  inline?: boolean
  stacked?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'

  displayFormat?: 'text' | 'badge' | 'icon' | 'chip'
  emptyStateText?: string
  showIcon?: boolean

  meta?: {
    visible?: boolean
    required?: boolean
    disabled?: boolean
    groupByKey?: GlobalEntityKey
    defaultSort?: boolean
  }
}

export type SelectableDisplayType<GE extends GlobalEntityKey = GlobalEntityKey> =
  | RelationshipDisplayType<GE, GlobalRelationshipKey>
  | VirtualDisplayType<GE>

export type SelectableDisplayTypeSuite = {
  [GE in GlobalEntityKey]: Partial<Record<SelectableFieldKey<GE>, SelectableDisplayType<GE>>>
}
