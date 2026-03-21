
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

const partInstanceById = (all: BookingPartInstance[]): Map<string, BookingPartInstance> =>
  new Map(all.map((p) => [p.id, p]))

export function resolvePricingCascadeParts(
  serviceParts: BookingPartInstance[],
  allPartInstances: BookingPartInstance[]
): BookingPartInstance[] {
  const byId = partInstanceById(allPartInstances)
  const ids = new Set<string>()
  for (const part of serviceParts) {
    const activeIds = asEmptyArray(part.activePartIds)
    for (const id of activeIds) {
      ids.add(id)
    }
  }
  return Array.from(ids)
    .map((id) => byId.get(id))
    .filter((p): p is BookingPartInstance => p !== undefined)
}

export function getEffectivePartsForFee(
  blockPartInstances: BookingPartInstance[],
  allPartInstances: BookingPartInstance[]
): BookingPartInstance[] {
  const cascaded = resolvePricingCascadeParts(blockPartInstances, allPartInstances)
  const blockIds = new Set(blockPartInstances.map((p) => p.id))
  const cascadedOnly = cascaded.filter((p) => !blockIds.has(p.id))
  return [...blockPartInstances, ...cascadedOnly]
}
