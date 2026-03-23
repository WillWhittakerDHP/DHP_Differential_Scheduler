/**
 * WHY: Resolve whether a block instance's shape is composable (pure given entity lookups).
 */

import type { BookingBlockInstance } from '@/types/transformers/bookingData'
import type { GlobalEntity } from '@/types/entities'

export function isBookingBlockInstanceComposable(
  blockInstance: BookingBlockInstance,
  getGlobalData: () => unknown | null,
  getGlobalEntityById: (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null
): boolean {
  if (!blockInstance) {
    return false
  }
  if (!getGlobalData()) {
    return false
  }
  const globalBlockInstance = getGlobalEntityById('blockInstance', blockInstance.id)
  if (!globalBlockInstance) {
    return false
  }
  const blockInstanceWithShapeRef = globalBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
  const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef
  const blockShape = getGlobalEntityById('blockShape', blockShapeRef)
  if (!blockShape) {
    return false
  }
  const blockShapeWithComposable = blockShape as GlobalEntity<'blockShape'> & { composable?: boolean }
  return blockShapeWithComposable.composable === true
}
