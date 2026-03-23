/**
 * WHY: Narrow property step data for availability API context (pure).
 */

import type { PropertyDetails } from '@/types/availability'

export function propertyDetailsSliceForAvailability(
  step: PropertyDetails | null | undefined
): Pick<
  PropertyDetails,
  'squareFootage' | 'bedrooms' | 'bathrooms' | 'foundationAccess' | 'additionalUnits'
> | null {
  if (!step) {
    return null
  }
  return {
    squareFootage: step.squareFootage,
    bedrooms: step.bedrooms,
    bathrooms: step.bathrooms,
    foundationAccess: step.foundationAccess,
    additionalUnits: step.additionalUnits,
  }
}
