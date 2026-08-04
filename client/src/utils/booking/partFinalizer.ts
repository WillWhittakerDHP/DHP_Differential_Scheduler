import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PartFinal } from './PartFinal'
import { createPartFinal } from './PartFinal'
import { createLogger } from '@/utils/logger'

export { calculateSlotShape } from './partFinalizerSlotShape'

const logger = createLogger('partFinalizer')

/**
 * WHY: One `PartFinal` per booking part instance (lineage key = `partInstance.id`).
 * Grouping only by `partShape` display name collides when multiple work items share a shape label (Architecture §14.3d).
 */
export function createPartFinals(parts: BookingPartInstance[]): PartFinal[] {
  return parts.map((part) => {
    if (part.partShape === undefined || part.partShape === null || part.partShape === '') {
      logger.debug('createPartFinals: partShape missing on part instance', { partId: part.id })
    }
    return createPartFinal(part.partShape, [part])
  })
}

export function filterZeroedParts(partFinals: PartFinal[]): PartFinal[] {
  return partFinals.filter((part) => !part.zeroOutPart)
}
