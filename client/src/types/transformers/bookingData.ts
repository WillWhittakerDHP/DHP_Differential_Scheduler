import type { CoreEntity } from '@shared/types/coreEntityTypes'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { AnnotationUiSlot } from '@shared/constants/annotationSlots'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import type { TernaryBoolean } from '@/types/ternary'
/** One annotation assignment row eligible for wizard slot resolution (from global batch + edges). */
export type BookingAnnotationUiCandidate = {
  orderIndex: number
  uiSlot: AnnotationUiSlot
  assignmentUserTypeFilter: GlobalEntityId | null
  text: string
  contentRows?: ReadonlyArray<{ text: string; userTypeBlockInstanceId: string | null }>
}

export type BookingBlockAnnotationUi = {
  candidates: BookingAnnotationUiCandidate[]
}

export type BookingPartInstance = CoreEntity & {
  entityKey: 'partInstance'
  partShape: string
  baseTime: number
  rateOverBaseTime: number
  baseFee: number
  rateOverBaseFee: number
  orderIndex: number
  zeroOutPart: boolean
  activePartIds: string[]
  /** Optional percentage off (e.g. 10 for 10% off) for coupon/discount; used by Part/Block Finals in fee pipeline. */
  percentageOff?: number
}

export type BookingBlockShape = {
  id: string
  name: string
  type: BlockShapeType
  canHaveParts: boolean
  isStateControl: boolean
  composable: boolean
}

export type BookingBlockInstance = CoreEntity & {
  entityKey: 'blockInstance'
  baseSqFt: number
  icon: string
  agentPermissions: TernaryBoolean
  orchestrator: boolean
  wizardVisible: boolean
  preClosing: boolean
  orderIndex: number
  blockShape: string
  blockShapeRef: string
  activeBlockIds: string[]
  partInstances: BookingPartInstance[]
  allowMultiple: boolean
  requiresUnitNumber: boolean | null
  number?: number | null
  isMultiFamily: boolean
  requiresAgent: boolean
  annotationUi?: BookingBlockAnnotationUi
  [key: string]: unknown
}

export type BookingData = {
  blockInstances: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[]
  blockShapes: BookingBlockShape[]
}
