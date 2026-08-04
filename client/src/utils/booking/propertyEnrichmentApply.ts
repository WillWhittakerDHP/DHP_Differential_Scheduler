/**
 * WHY: Map PropertyEnrichment API response onto property step form writers (pure callbacks).
 */

import type { PropertyEnrichmentResponse } from '@shared/types/propertyEnrichmentTypes'
import { PROPERTY_SOURCE, type PropertySource } from '@/types/propertyForm'
import { extractOptionalString, safeArray } from '@/utils/transformers/transformerPrimitives'

export interface PropertyEnrichmentFormWriters {
  setMlsNumber: (v: string) => void
  setSquareFootage: (v: number | null) => void
  setBedrooms: (v: number | null) => void
  setBathrooms: (v: number | null) => void
  setFoundationAccess: (v: 'basement' | 'crawlspace' | 'slab' | null) => void
  setAdditionalUnits: (v: number | null) => void
  setHvacCount: (v: number | null) => void
  setWaterHeaterCount: (v: number | null) => void
  setKitchenApplianceCount: (v: number | null) => void
  setSource: (v: PropertySource) => void
  setSuggestedBlockInstanceIds: (v: string[]) => void
  setPropertySize: (v: number) => void
}

export function applyPropertyEnrichmentToFormFields(
  enrichment: PropertyEnrichmentResponse,
  writers: PropertyEnrichmentFormWriters
): void {
  writers.setMlsNumber(extractOptionalString(enrichment.mlsNumber, 'enrichment.mlsNumber'))
  writers.setSquareFootage(enrichment.squareFootage ?? null)
  writers.setBedrooms(enrichment.bedrooms ?? null)
  writers.setBathrooms(enrichment.bathrooms ?? null)
  writers.setFoundationAccess(enrichment.foundationAccess ?? null)
  writers.setAdditionalUnits(enrichment.additionalUnits ?? null)
  writers.setHvacCount(enrichment.hvacCount ?? null)
  writers.setWaterHeaterCount(enrichment.waterHeaterCount ?? null)
  writers.setKitchenApplianceCount(enrichment.kitchenApplianceCount ?? null)
  writers.setSource(PROPERTY_SOURCE.API)
  writers.setSuggestedBlockInstanceIds(safeArray(enrichment.suggestedBlockInstanceIds))
  if (enrichment.squareFootage != null) {
    writers.setPropertySize(enrichment.squareFootage)
  }
}
