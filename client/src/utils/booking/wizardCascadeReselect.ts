/**
 * WHY: After parent cascade changes, re-attach child selections that remain valid in the new lists.
 */
import { resolveByIds } from '@/utils/collections/resolveByIds'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function wizardCascadeBlockIds(blocks: readonly BookingBlockInstance[]): string[] {
  return blocks.map((b) => b.id)
}

/** Single-select semantics: first previous id that still exists in `available`, else []. */
export function restoreSingleCascadeSelection(
  previousIds: readonly string[],
  available: readonly BookingBlockInstance[]
): BookingBlockInstance[] {
  for (const id of previousIds) {
    const { resolved } = resolveByIds(available, [id])
    const first = resolved[0]
    if (first !== undefined) {
      return [first]
    }
  }
  return []
}

/** Multi-select: keep previous ids that still appear in `available`, preserve id order. */
export function restoreMultiCascadeSelection(
  previousIds: readonly string[],
  available: readonly BookingBlockInstance[]
): BookingBlockInstance[] {
  return resolveByIds(available, previousIds).resolved
}
