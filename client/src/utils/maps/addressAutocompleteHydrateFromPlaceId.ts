/**
 * Hydrates address text/coordinates from a known place id when the model value is still a stub.
 * WHY: Keeps async Maps API side effects out of the main autocomplete composable.
 */
import { fetchPlaceDetails } from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'
import { shouldHydrateAddressFromPlaceId } from '@shared/utils/defaultLocationHeuristics'
import type { UseAddressAutocompleteEmit } from '@/types/addressAutocomplete'

const logger = createLogger('addressAutocompleteHydrateFromPlaceId')

export async function hydrateAddressFromPlaceIdIfNeeded(
  placeId: string,
  modelValue: string,
  emit: UseAddressAutocompleteEmit,
  getTokenFn: () => Promise<string>
): Promise<void> {
  if (!shouldHydrateAddressFromPlaceId(modelValue)) {
    return
  }
  try {
    const token = await getTokenFn()
    const details = await fetchPlaceDetails(placeId, token)
    const formatted = details.formattedAddress?.trim()
    if (!formatted || formatted === modelValue.trim()) {
      return
    }
    emit['update:modelValue'](formatted)
    if (details.coordinates) {
      emit['update:coordinates'](details.coordinates)
    }
    emit['place-selected'](details)
  } catch (error) {
    logger.warn('[hydrateAddressFromPlaceIdIfNeeded] failed', { error })
  }
}
