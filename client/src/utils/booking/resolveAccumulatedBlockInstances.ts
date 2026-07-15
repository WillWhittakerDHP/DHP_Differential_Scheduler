/**
 * Apply accumulator lateral inclusion gates to booking block lists.
 * WHY: Pure glue between wizard selections, property facts, and shared evaluator.
 */
import {
  resolveAccumulatorInclusions,
  type AccumulationLinkEdge,
  type PropertyFactBag,
} from '@shared/constants/accumulator'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function propertyFactsFromPropertyDetails(
  details: Record<string, unknown> | null | undefined
): PropertyFactBag {
  if (!details) {
    return {}
  }
  const out: PropertyFactBag = {}
  for (const [key, value] of Object.entries(details)) {
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'string' ||
      value === null ||
      value === undefined
    ) {
      out[key] = value
    }
  }
  return out
}

export function accumulationEdgesFromRelationships(
  relationships: Array<{
    parentId?: string
    childId?: string
    parent?: { id?: string }
    children?: Array<{ id?: string }>
    propertyFactKey?: string
    property_fact_key?: string
    disabled?: boolean
  }> | null | undefined
): AccumulationLinkEdge[] {
  if (!relationships || relationships.length === 0) {
    return []
  }
  const edges: AccumulationLinkEdge[] = []
  for (const rel of relationships) {
    const parentId = rel.parentId ?? rel.parent?.id
    const factKey = String(rel.propertyFactKey ?? rel.property_fact_key ?? '').trim()
    if (rel.children && rel.children.length > 0) {
      for (const child of rel.children) {
        const childId = child.id
        if (!parentId || !childId) continue
        edges.push({
          parentId,
          childId,
          propertyFactKey: factKey,
          disabled: rel.disabled === true,
        })
      }
      continue
    }
    const childId = rel.childId
    if (!parentId || !childId) continue
    edges.push({
      parentId,
      childId,
      propertyFactKey: factKey,
      disabled: rel.disabled === true,
    })
  }
  return edges
}

/**
 * Return BookingBlockInstances that pass inclusion gates for the current selection.
 */
export function resolveAccumulatedBlockInstances(params: {
  selectedServiceBlocks: BookingBlockInstance[]
  allBlockInstances: BookingBlockInstance[]
  accumulationRelationships: Parameters<typeof accumulationEdgesFromRelationships>[0]
  propertyDetails: Record<string, unknown> | null | undefined
}): BookingBlockInstance[] {
  const links = accumulationEdgesFromRelationships(params.accumulationRelationships)
  const includedIds = new Set(
    resolveAccumulatorInclusions({
      selectedParentIds: params.selectedServiceBlocks.map((b) => b.id),
      parents: params.allBlockInstances.map((b) => ({
        id: b.id,
        accumulator: b.accumulator === true,
      })),
      links,
      propertyFacts: propertyFactsFromPropertyDetails(params.propertyDetails),
    })
  )
  return params.allBlockInstances.filter((b) => includedIds.has(b.id))
}
