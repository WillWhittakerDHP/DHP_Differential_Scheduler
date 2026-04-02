/**
 * WHY: Differential override detection shared by availability logic (pure, testable).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function selectedBlocksHaveDifferentialOverride(
  _serviceBlocks: BookingBlockInstance[],
  _optionBlocks: BookingBlockInstance[]
): boolean {
  return false
}
