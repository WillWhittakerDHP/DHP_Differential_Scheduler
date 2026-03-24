/**
PATTERN: Same pattern as mapsApiService.ts
 */
import axios from 'axios'
import { createLogger } from '@/utils/logger'
import type { PropertyEnrichmentResponse } from '@shared/types/propertyEnrichmentTypes'

const logger = createLogger('propertyEnrichmentApiService')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export type { PropertyEnrichmentResponse }

export async function fetchPropertyEnrichment(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string
): Promise<PropertyEnrichmentResponse | null> {
  if (!address?.trim()) {
    return null
  }

  const params = new URLSearchParams({ address: address.trim() })
  if (city?.trim()) params.set('city', city.trim())
  if (state?.trim()) params.set('state', state.trim())
  if (zipCode?.trim()) params.set('zipCode', zipCode.trim())

  try {
    const response = await axios.get<PropertyEnrichmentResponse>(
      `${API_BASE_URL}/api/v1/external/property-enrichment?${params.toString()}`
    )
    return response.data
  } catch (error) {
    logger.debug('[fetchPropertyEnrichment] caught', { error })
    return handlePropertyEnrichmentError(error)
  }
}

function handlePropertyEnrichmentError(error: unknown): PropertyEnrichmentResponse | null {
  if (!axios.isAxiosError(error)) {
    logger.warn('[fetchPropertyEnrichment] Request failed', { error })
    return null
  }
  const status = error.response?.status
  if (status === 404) {
    logger.debug('[fetchPropertyEnrichment] No listing found')
    return null
  }
  if (status === 503) {
    logger.debug('[fetchPropertyEnrichment] Service not configured')
    return null
  }
  if (status === 429) {
    logger.warn('[fetchPropertyEnrichment] Rate limited')
    throw new Error('Property enrichment rate limit exceeded')
  }
  logger.warn('[fetchPropertyEnrichment] Request failed', { error })
  return null
}
