import type { GlobalEntityKey } from '@/constants/entities'

const MAX_DISPLAY_ITEMS = 2

function formatTruncatedListCore(items: string[], maxDisplay: number = MAX_DISPLAY_ITEMS): string {
  if (items.length === 0) return ''
  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay
  if (remaining <= 0) return displayItems.join(', ')
  return `${displayItems.join(', ')} +${remaining} more`
}

export function formatTruncatedList(items: string[], maxDisplay: number = MAX_DISPLAY_ITEMS): string {
  return formatTruncatedListCore(items, maxDisplay)
}

interface PartsSummaryResolvers {
  namesForPartInstanceIds: (ids: unknown[]) => string[]
  namesForPartShapeIds: (ids: unknown[]) => string[]
}

export function buildPartsSummaryForSubPanel(
  entityKey: GlobalEntityKey,
  values: Record<string, unknown>,
  resolvers: PartsSummaryResolvers
): string {
  if (entityKey === 'blockInstance') {
    const partAssignments = values.partAssignments
    if (!Array.isArray(partAssignments) || partAssignments.length === 0) return ''
    return formatTruncatedListCore(resolvers.namesForPartInstanceIds(partAssignments))
  }
  if (entityKey === 'blockShape') {
    const validPartCascades = values.validPartCascades
    if (!Array.isArray(validPartCascades) || validPartCascades.length === 0) return ''
    return formatTruncatedListCore(resolvers.namesForPartShapeIds(validPartCascades))
  }
  return ''
}

export function buildRelationshipTypesForSubPanel(
  entityKey: GlobalEntityKey,
  formValues: Record<string, unknown>,
  blockShapeDisplayName: string
): string[] {
  const relationshipTypes: string[] = []
  if (entityKey === 'blockInstance') {
    appendIfNonEmptyArray(formValues.bookingCascades, relationshipTypes, 'Downstream Instance Links')
    appendIfNonEmptyArray(formValues.accumulationLinks, relationshipTypes, 'Accumulation Links')
    appendIfNonEmptyArray(formValues.instanceComponents, relationshipTypes, `${blockShapeDisplayName} Components`)
    return relationshipTypes
  }
  if (entityKey === 'blockShape') {
    appendIfNonEmptyArray(formValues.validBookingCascades, relationshipTypes, 'Allowed Downstream Shapes')
    return relationshipTypes
  }
  if (entityKey === 'partInstance') {
    appendIfNonEmptyArray(formValues.pricingCascades, relationshipTypes, 'Pricing Cascades')
    return relationshipTypes
  }
  if (entityKey === 'partShape') {
    appendIfNonEmptyArray(formValues.validPricingCascades, relationshipTypes, 'Valid Pricing Cascades')
    return relationshipTypes
  }
  return relationshipTypes
}

function appendIfNonEmptyArray(
  raw: unknown,
  target: string[],
  label: string
): void {
  const arr = Array.isArray(raw) ? raw : []
  if (arr.length > 0) target.push(label)
}
