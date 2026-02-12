/**
 * Pricing Cascade Resolver
 *
 * Resolves part instances that contribute to a service part's pricing via the
 * pricing cascade (partInstance -> partInstance). Used to include property-detail
 * parts (e.g. interiors, decks, HVAC) in a service's fee when configured.
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

const partInstanceById = (all: BookingPartInstance[]): Map<string, BookingPartInstance> =>
  new Map(all.map((p) => [p.id, p]))

/**
 * Resolve pricing cascade child parts from the full part instance pool.
 * LEARNING: For each service part with activePartIds, collects the corresponding
 * downstream parts (e.g. property parts) that contribute to this part's pricing.
 *
 * @param serviceParts - Part instances on the service (or any parent) block
 * @param allPartInstances - All part instances from the booking context (e.g. all selected blocks)
 * @returns Cascaded part instances (children in pricing cascade), deduplicated by id
 */
export function resolvePricingCascadeParts(
  serviceParts: BookingPartInstance[],
  allPartInstances: BookingPartInstance[]
): BookingPartInstance[] {
  const byId = partInstanceById(allPartInstances)
  const ids = new Set<string>()
  for (const part of serviceParts) {
    const activeIds = part.activePartIds ?? []
    for (const id of activeIds) {
      ids.add(id)
    }
  }
  return Array.from(ids)
    .map((id) => byId.get(id))
    .filter((p): p is BookingPartInstance => p !== undefined)
}

/**
 * Effective parts for fee calculation: block's own parts plus any cascaded parts.
 * Use this to build the part list passed to createBlockFinal when pricing cascades
 * should be included (e.g. for service blocks pulling in property part pricing).
 *
 * @param blockPartInstances - Part instances on the block
 * @param allPartInstances - All part instances from the booking context
 * @returns Combined list: block parts first, then cascaded parts (no duplicate ids)
 */
export function getEffectivePartsForFee(
  blockPartInstances: BookingPartInstance[],
  allPartInstances: BookingPartInstance[]
): BookingPartInstance[] {
  const cascaded = resolvePricingCascadeParts(blockPartInstances, allPartInstances)
  const blockIds = new Set(blockPartInstances.map((p) => p.id))
  const cascadedOnly = cascaded.filter((p) => !blockIds.has(p.id))
  return [...blockPartInstances, ...cascadedOnly]
}
