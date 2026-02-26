import type { CoreEntity } from '@shared/types/coreEntityTypes'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import type { BookingMode } from '@/constants/bookingMode'
import type { TernaryBoolean } from '@/types/ternary'

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
  bookingMode: BookingMode
  differential: TernaryBoolean
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
  [key: string]: unknown
}

export type BookingData = {
  blockInstances: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[]
  blockShapes: BookingBlockShape[]
}
