/**
 * WHY: First matching suggested block toggles wizard selection (pure; wizard passed as callbacks).
 */

import type { BookingBlockInstance } from '@/types/transformers/bookingData'

export function applyFirstSuggestedBlockFromLists(
  suggestedIds: string[],
  propertyBlocks: BookingBlockInstance[],
  lineBlocks: BookingBlockInstance[],
  toggleProperty: (block: BookingBlockInstance) => void,
  toggleLine: (block: BookingBlockInstance) => void
): void {
  for (const id of suggestedIds) {
    const propBlock = propertyBlocks.find((b) => b.id === id)
    if (propBlock) {
      toggleProperty(propBlock)
      break
    }
    const lineBlock = lineBlocks.find((b) => b.id === id)
    if (lineBlock) {
      toggleLine(lineBlock)
    }
  }
}
