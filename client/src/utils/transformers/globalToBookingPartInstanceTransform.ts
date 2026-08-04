import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { BookingPartInstance } from '@/types/transformers/bookingData'
import { findRelationshipsByParent, extractChildIds } from './relationshipTransformers'
import { isBookingEntityActive } from './globalToBookingEntityActive'

const PERCENTAGE_OFF_ENTITY_KEYS = [
  'percentageOff',
  'percentage_off',
  'discountPercent',
  'discount_percent',
  'percentOff',
  'percent_off',
] as const

function readPercentageOffFromEntity(entity: Record<string, unknown>): number | undefined {
  for (const k of PERCENTAGE_OFF_ENTITY_KEYS) {
    const v = entity[k]
    if (typeof v === 'number' && !Number.isNaN(v)) {
      return v
    }
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v)
      if (!Number.isNaN(n)) {
        return n
      }
    }
  }
  return undefined
}

export function transformPartInstance(
  partInstance: GlobalEntity<'partInstance'>,
  partShapeById: Map<string, GlobalEntity<'partShape'>>,
  pricingCascadesRelationships: GlobalRelationship[] = []
): BookingPartInstance {
  const partShapeRef = (partInstance as GlobalEntity<'partInstance'> & { partShapeRef: string }).partShapeRef
  const partShapeEntity = partShapeById.get(partShapeRef)
  const partShape = partShapeEntity?.name ? partShapeEntity.name : partShapeRef
  const partInstanceWithProps = partInstance as GlobalEntity<'partInstance'> & {
    baseTime?: number
    timePerUnit?: number
    baseMultiplier?: number
    base_multiplier?: number
    rateMultiplier?: number
    rate_multiplier?: number
    baseFee?: number
    feePerUnit?: number
    zeroOutPart?: boolean
    percentageOff?: number
    percentage_off?: number
  }
  const pricingRels = findRelationshipsByParent(partInstance.id, pricingCascadesRelationships)
  const activePartIds = extractChildIds(pricingRels)
  const percentageOff =
    readPercentageOffFromEntity(partInstance as Record<string, unknown>) ??
    partInstanceWithProps.percentageOff ??
    partInstanceWithProps.percentage_off
  return {
    id: partInstance.id,
    entityKey: 'partInstance',
    name: partInstance.name,
    active: isBookingEntityActive(partInstance),
    partShape,
    baseTime: partInstanceWithProps.baseTime ?? 0,
    timePerUnit: partInstanceWithProps.timePerUnit ?? 0,
    baseMultiplier: partInstanceWithProps.baseMultiplier ?? partInstanceWithProps.base_multiplier ?? 1,
    rateMultiplier: partInstanceWithProps.rateMultiplier ?? partInstanceWithProps.rate_multiplier ?? 1,
    baseFee: partInstanceWithProps.baseFee ?? 0,
    feePerUnit: partInstanceWithProps.feePerUnit ?? 0,
    orderIndex: partInstance.orderIndex,
    zeroOutPart: partInstanceWithProps.zeroOutPart ?? false,
    activePartIds,
    ...(percentageOff !== undefined && percentageOff !== null && { percentageOff }),
  }
}
