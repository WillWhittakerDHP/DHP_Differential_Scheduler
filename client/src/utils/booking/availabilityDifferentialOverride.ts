/**
 * WHY: Differential override detection shared by availability logic (pure, testable).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function selectedBlocksHaveDifferentialOverride(
  serviceBlocks: BookingBlockInstance[],
  optionBlocks: BookingBlockInstance[]
): boolean {
  return (
    serviceBlocks.some((service) => service.differential === 'override') ||
    optionBlocks.some((option) => option.differential === 'override')
  )
}
