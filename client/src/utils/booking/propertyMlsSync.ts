/**
 * WHY: MLS enrichment fetch + gate logic without Vue imports (composable passes refs via callbacks).
 */

import type { Ref } from 'vue'
import type { PropertyEnrichmentResponse } from '@shared/types/propertyEnrichmentTypes'
import type { PropertyFormData } from '@/types/propertyForm'
import type { AppLogger } from '@/utils/logger'

interface PropertyMlsSyncDeps {
  resolveGate: () => { placeId: string; address: string } | null
  getCityStateZip: () => { city?: string; state?: string; zip?: string }
  setLoading: (loading: boolean) => void
  clearSuggestedBlockIds: () => void
  fetchEnrichment: (
    address: string,
    city: string | undefined,
    state: string | undefined,
    zip: string | undefined
  ) => Promise<PropertyEnrichmentResponse | null>
  onEnrichmentLoaded: (enrichment: PropertyEnrichmentResponse) => void
}

/** Builds the callback bag for runPropertyMlsEnrichmentFlow (flattens composable nesting). */
export function buildMlsSyncDeps(input: {
  formData: PropertyFormData
  isEnrichmentLoading: Ref<boolean>
  fetchEnrichment: PropertyMlsSyncDeps['fetchEnrichment']
  onEnrichmentLoaded: (enrichment: PropertyEnrichmentResponse) => void
}): PropertyMlsSyncDeps {
  const { formData, isEnrichmentLoading, fetchEnrichment, onEnrichmentLoaded } = input
  return {
    resolveGate: () => {
      const placeId = formData.candidatePlaceId?.value
      const address = formData.address?.value?.trim()
      if (!placeId || !address) {
        return null
      }
      return { placeId, address }
    },
    getCityStateZip: () => ({
      city: formData.city?.value,
      state: formData.state?.value,
      zip: formData.zipCode?.value,
    }),
    setLoading: (loading) => {
      isEnrichmentLoading.value = loading
    },
    clearSuggestedBlockIds: () => {
      if (formData.suggestedBlockInstanceIds) {
        formData.suggestedBlockInstanceIds.value = []
      }
    },
    fetchEnrichment,
    onEnrichmentLoaded,
  }
}

export async function runPropertyMlsEnrichmentFlow(
  deps: PropertyMlsSyncDeps,
  logger: AppLogger
): Promise<void> {
  const gate = deps.resolveGate()
  if (!gate) {
    return
  }
  const { placeId, address } = gate
  if (placeId.length < 15) {
    return
  }

  deps.setLoading(true)
  deps.clearSuggestedBlockIds()

  try {
    let enrichment: PropertyEnrichmentResponse | null
    try {
      const { city, state, zip } = deps.getCityStateZip()
      enrichment = await deps.fetchEnrichment(address, city, state, zip)
    } catch (err) {
      logger.warn('MLS enrichment request failed', { err })
      return
    }

    if (!enrichment) {
      return
    }

    deps.onEnrichmentLoaded(enrichment)
  } finally {
    deps.setLoading(false)
  }
}
