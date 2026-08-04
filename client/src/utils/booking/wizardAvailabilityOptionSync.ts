/**
 * WHY: Keeps availability option selection consistent with filtered options (pure next-state).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function selectionIsOnlyBlock(
  selected: BookingBlockInstance[],
  block: BookingBlockInstance
): boolean {
  return selected.length === 1 && selected[0]?.id === block.id
}

function nextSelectionForSingleAvailable(
  available: BookingBlockInstance[],
  selected: BookingBlockInstance[]
): BookingBlockInstance[] | undefined {
  const only = available[0]
  if (only === undefined) {
    return selected.length > 0 ? [] : undefined
  }
  return selectionIsOnlyBlock(selected, only) ? undefined : [only]
}

function nextSelectionForCurrentValid(
  available: BookingBlockInstance[],
  selected: BookingBlockInstance[]
): { matched: boolean; next: BookingBlockInstance[] | undefined } {
  const first = selected[0]
  if (first === undefined || !available.some((a) => a.id === first.id)) {
    return { matched: false, next: undefined }
  }
  return { matched: true, next: selected.length === 1 ? undefined : [first] }
}

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
    return nextSelectionForSingleAvailable(available, selected)
  }
  const validSelection = nextSelectionForCurrentValid(available, selected)
  if (validSelection.matched) {
    return validSelection.next
  }
  return selected.length > 0 ? [] : undefined
}
