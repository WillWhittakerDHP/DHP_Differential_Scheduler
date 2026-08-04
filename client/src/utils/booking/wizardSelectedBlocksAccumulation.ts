/**
 * WHY: Single ordering of user + service + property + option blocks for availability,
 * plus property-fact lateral inclusions (accumulator) that are not wizard picks.
 */

import type { AccumulationLinkEdge } from '@shared/constants/accumulator'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { resolveAccumulatedBlockInstances } from '@/utils/booking/resolveAccumulatedBlockInstances'

export function accumulateWizardSelectedBlockInstances(wizard: {
  selectedUserTypeBlock: { value: BookingBlockInstance | null }
  selectedServiceTypeBlocks: { value: BookingBlockInstance[] }
  selectedPropertyTypeBlocks: { value: BookingBlockInstance[] }
  selectedOptionTypeBlocks: { value: BookingBlockInstance[] }
}): BookingBlockInstance[] {
  return [
    ...(wizard.selectedUserTypeBlock.value ? [wizard.selectedUserTypeBlock.value] : []),
    ...wizard.selectedServiceTypeBlocks.value,
    ...wizard.selectedPropertyTypeBlocks.value,
    ...wizard.selectedOptionTypeBlocks.value,
  ]
}

/**
 * Append accumulator inclusions that are not already in the wizard selection.
 * WHY: Duration / fees / appointment time ids must include auto-included characteristics.
 */
export function mergeWizardSelectionWithAccumulatorInclusions(params: {
  wizardSelection: BookingBlockInstance[]
  selectedServiceBlocks: BookingBlockInstance[]
  blockInstanceCatalog: BookingBlockInstance[]
  accumulationLinks: AccumulationLinkEdge[]
  propertyDetails: Record<string, unknown> | null | undefined
}): BookingBlockInstance[] {
  const included = resolveAccumulatedBlockInstances({
    selectedServiceBlocks: params.selectedServiceBlocks,
    allBlockInstances: params.blockInstanceCatalog,
    accumulationRelationships: params.accumulationLinks,
    propertyDetails: params.propertyDetails,
  })
  if (included.length === 0) {
    return params.wizardSelection
  }
  const seen = new Set(params.wizardSelection.map((b) => b.id))
  const extras = included.filter((b) => !seen.has(b.id))
  if (extras.length === 0) {
    return params.wizardSelection
  }
  return [...params.wizardSelection, ...extras]
}
