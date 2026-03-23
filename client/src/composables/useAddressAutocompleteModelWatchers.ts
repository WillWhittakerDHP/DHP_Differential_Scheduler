/**
 * Syncs v-model / placeId props into local autocomplete state and triggers hydration when needed.
 * WHY: Isolates watch side effects from selection and suggestion fetch (composables-logic).
 */
import { watch, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'
import { hydrateAddressFromPlaceIdIfNeeded } from '@/utils/maps/addressAutocompleteHydrateFromPlaceId'
import type { AutocompletePrediction } from '@/services/mapsApiService'
import type { UseAddressAutocompleteOptions } from '@/types/addressAutocomplete'

const logger = createLogger('useAddressAutocompleteModelWatchers')

interface UseAddressAutocompleteModelWatchersState {
  searchInput: Ref<string>
  selectedAddress: Ref<AutocompletePrediction | null>
  suggestions: Ref<AutocompletePrediction[]>
  hasInitialAddressFromProps: Ref<boolean>
}

export function useAddressAutocompleteModelWatchers(
  options: UseAddressAutocompleteOptions,
  getToken: () => Promise<string>,
  state: UseAddressAutocompleteModelWatchersState
): void {
  const { searchInput, selectedAddress, suggestions, hasInitialAddressFromProps } = state

  watch(
    () => options.modelValue(),
    (newValue, oldValue) => {
      if (newValue && (!selectedAddress.value || selectedAddress.value.description !== newValue)) {
        const syntheticPrediction: AutocompletePrediction = {
          placeId: options.placeId() ?? `synthetic-${Date.now()}`,
          description: newValue,
          mainText: newValue,
          secondaryText: '',
        }
        suggestions.value = [syntheticPrediction]
        selectedAddress.value = syntheticPrediction
        searchInput.value = newValue
        hasInitialAddressFromProps.value = true
        logger.debug('[watch:modelValue] Created synthetic item for initial address:', newValue)
      }
      if (!newValue && oldValue) {
        hasInitialAddressFromProps.value = false
        selectedAddress.value = null
        suggestions.value = []
      }
    },
    { immediate: true }
  )

  watch(
    () => {
      const trimmed = options.placeId()?.trim()
      const placeIdPart = trimmed === undefined ? '' : trimmed
      return [placeIdPart, options.modelValue()] as const
    },
    async ([placeId, modelValue]) => {
      if (!placeId || !options.emit) {
        return
      }
      await hydrateAddressFromPlaceIdIfNeeded(placeId, modelValue, options.emit, getToken)
    },
    { immediate: true }
  )
}
