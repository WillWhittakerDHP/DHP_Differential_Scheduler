import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { BookingPartInstance } from '@/types/transformers/bookingData'
import { findRelationshipsByParent, extractChildIds } from './relationshipTransformers'
import { isBookingEntityActive } from './globalToBookingEntityActive'

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
    rateOverBaseTime?: number
    baseFee?: number
    rateOverBaseFee?: number
    zeroOutPart?: boolean
    percentageOff?: number
    percentage_off?: number
  }
  const pricingRels = findRelationshipsByParent(partInstance.id, pricingCascadesRelationships)
  const activePartIds = extractChildIds(pricingRels)
  const percentageOff = partInstanceWithProps.percentageOff ?? partInstanceWithProps.percentage_off
  return {
    id: partInstance.id,
    entityKey: 'partInstance',
    name: partInstance.name,
    active: isBookingEntityActive(partInstance),
    partShape,
    baseTime: partInstanceWithProps.baseTime ?? 0,
    rateOverBaseTime: partInstanceWithProps.rateOverBaseTime ?? 0,
    baseFee: partInstanceWithProps.baseFee ?? 0,
    rateOverBaseFee: partInstanceWithProps.rateOverBaseFee ?? 0,
    orderIndex: partInstance.orderIndex,
    zeroOutPart: partInstanceWithProps.zeroOutPart ?? false,
    activePartIds,
    ...(percentageOff !== undefined && percentageOff !== null && { percentageOff }),
  }
}
