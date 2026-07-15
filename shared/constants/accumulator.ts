/**
 * Accumulator = lateral inclusion gates (Will, 2026-07-13).
 *
 * WHEN a selected service has accumulator=true and an accumulation_link to a
 * time/characteristic block, that child is included only if the linked
 * property fact is present for this booking — independent of whether the user
 * picks that characteristic in the wizard.
 *
 * Truth table (Equipment Testing → HVAC):
 *   service selected + fact present → include
 *   service selected + fact absent  → exclude
 *   service not selected            → exclude
 *
 * Distinct from bookingCascades (user-selectable lateral options) and from
 * composite/instanceComponents (vertical same-shape packaging).
 */

export type PropertyFactValue = number | boolean | string | null | undefined

/** Known fact keys (extensible — missing keys evaluate as absent). */
export const PROPERTY_FACT_KEYS = {
  SQUARE_FOOTAGE: 'squareFootage',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  FOUNDATION_ACCESS: 'foundationAccess',
  ADDITIONAL_UNITS: 'additionalUnits',
  HVAC_COUNT: 'hvacCount',
  WATER_HEATER_COUNT: 'waterHeaterCount',
  KITCHEN_APPLIANCE_COUNT: 'kitchenApplianceCount',
} as const

export type PropertyFactKey = (typeof PROPERTY_FACT_KEYS)[keyof typeof PROPERTY_FACT_KEYS] | string

export const PROPERTY_FACT_OPTIONS: Array<{ value: PropertyFactKey; label: string }> = [
  { value: PROPERTY_FACT_KEYS.SQUARE_FOOTAGE, label: 'Square footage' },
  { value: PROPERTY_FACT_KEYS.BEDROOMS, label: 'Bedrooms' },
  { value: PROPERTY_FACT_KEYS.BATHROOMS, label: 'Bathrooms' },
  { value: PROPERTY_FACT_KEYS.FOUNDATION_ACCESS, label: 'Foundation access' },
  { value: PROPERTY_FACT_KEYS.ADDITIONAL_UNITS, label: 'Additional units' },
  { value: PROPERTY_FACT_KEYS.HVAC_COUNT, label: 'HVAC count' },
  { value: PROPERTY_FACT_KEYS.WATER_HEATER_COUNT, label: 'Water heater count' },
  { value: PROPERTY_FACT_KEYS.KITCHEN_APPLIANCE_COUNT, label: 'Kitchen appliance count' },
]

export type PropertyFactBag = Record<string, PropertyFactValue>

export interface AccumulationLinkEdge {
  parentId: string
  childId: string
  /** Which property_details / booking fact gates this edge. Empty → never include. */
  propertyFactKey: string
  disabled?: boolean
}

export interface AccumulatorParent {
  id: string
  /** Only parents with accumulator=true participate. */
  accumulator: boolean
}

/**
 * A fact is "present" when it indicates real property data:
 * - number > 0
 * - boolean true
 * - non-empty string
 * null / undefined / 0 / false / '' → absent
 */
export function isPropertyFactPresent(value: PropertyFactValue): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0
  }
  if (typeof value === 'boolean') {
    return value === true
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return false
}

/**
 * Resolve child block instance ids that pass lateral inclusion gates.
 * WHY: Pure function — booking pipeline and tests share one rule.
 */
export function resolveAccumulatorInclusions(params: {
  selectedParentIds: readonly string[]
  parents: readonly AccumulatorParent[]
  links: readonly AccumulationLinkEdge[]
  propertyFacts: PropertyFactBag
}): string[] {
  const selected = new Set(params.selectedParentIds)
  const accumulatorIds = new Set(
    params.parents.filter((p) => p.accumulator === true).map((p) => p.id)
  )

  const included: string[] = []
  const seen = new Set<string>()

  for (const link of params.links) {
    if (link.disabled === true) {
      continue
    }
    if (!selected.has(link.parentId) || !accumulatorIds.has(link.parentId)) {
      continue
    }
    const key = String(link.propertyFactKey ?? '').trim()
    if (key.length === 0) {
      continue
    }
    if (!isPropertyFactPresent(params.propertyFacts[key])) {
      continue
    }
    if (seen.has(link.childId)) {
      continue
    }
    seen.add(link.childId)
    included.push(link.childId)
  }

  return included
}
