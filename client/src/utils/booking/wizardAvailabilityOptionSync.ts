/**
 * WHY: Keeps availability option selection consistent with filtered options (pure next-state).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * @returns New selection array if an update is required; `undefined` if the current selection is already valid.
 */
export function computeNextAvailabilityOptionSelection(
  available: BookingBlockInstance[],
  selected: BookingBlockInstance[]
): BookingBlockInstance[] | undefined {
  if (available.length === 0) {
    return selected.length > 0 ? [] : undefined
  }
  if (available.length === 1) {
    const only = available[0]
    if (only === undefined) {
      return selected.length > 0 ? [] : undefined
    }
    if (selected.length === 1 && selected[0]?.id === only.id) {
      return undefined
    }
    return [only]
  }
  const first = selected[0]
  if (first !== undefined && available.some((a) => a.id === first.id)) {
    if (selected.length !== 1) {
      return [first]
    }
    return undefined
  }
  if (selected.length > 0) {
    return []
  }
  return undefined
}
