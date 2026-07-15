import type { CoreEntity } from '@shared/types/coreEntityTypes'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { AnnotationUiSlot } from '@shared/constants/annotationSlots'
import type { WizardPlacement } from '@shared/constants/wizardPlacement'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
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
  timePerUnit: number
  baseMultiplier: number
  rateMultiplier: number
  baseFee: number
  feePerUnit: number
  orderIndex: number
  zeroOutPart: boolean
  activePartIds: string[]
  /** Optional percentage off (e.g. 10 for 10% off) for coupon/discount; used by Part/Block Finals in fee pipeline. */
  percentageOff?: number
}

export type BookingBlockShape = {
  id: string
  name: string
  semanticType: BlockShapeType
}

export type BookingBlockInstance = CoreEntity & {
  entityKey: 'blockInstance'
  icon: string
  /** Semantic type of the parent block shape; distinct from user-role semanticType on user block instances. */
  blockShapeSemanticType: BlockShapeType
  orchestrator: boolean
  /** Lateral inclusion gates — see shared/constants/accumulator.ts */
  accumulator: boolean
  wizardPlacement: WizardPlacement
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
  semanticType?: string | null
  annotationUi?: BookingBlockAnnotationUi
  [key: string]: unknown
}

export type BookingData = {
  blockInstances: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[]
  blockShapes: BookingBlockShape[]
  /**
   * Full booking-transformed catalog (including hidden placement) for accumulator lookups.
   * Component children stay excluded — they roll up into composites.
   */
  blockInstanceCatalog: BookingBlockInstance[]
  /** Lateral inclusion-gate edges (service → characteristic), with property fact keys. */
  accumulationLinks: Array<{
    parentId: string
    childId: string
    propertyFactKey: string
  }>
}
