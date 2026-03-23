/**
 * Address autocomplete orchestration: composes model sync, suggestions fetch, and selection handlers.
 * WHY: Submodules own watches, query debouncing, and selection emits (composables-logic split).
 */

import { ref } from 'vue'
import type { AutocompletePrediction } from '@/services/mapsApiService'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import { useAddressAutocompleteModelWatchers } from '@/composables/useAddressAutocompleteModelWatchers'
import { useAddressAutocompleteSuggestions } from '@/composables/useAddressAutocompleteSuggestions'
import { useAddressAutocompleteSelection } from '@/composables/useAddressAutocompleteSelection'
import type {
  UseAddressAutocompleteOptions,
  UseAddressAutocompleteReturn,
} from '@/types/addressAutocomplete'

export type { Coordinates, PlaceDetails, MapsApiError } from '@/services/mapsApiService'

export function useAddressAutocomplete(
  options: UseAddressAutocompleteOptions
): UseAddressAutocompleteReturn {
  const { token: sessionToken, getToken, resetToken } = useMapsSessionToken()

  const searchInput = ref('')
  const selectedAddress = ref<AutocompletePrediction | null>(null)
  const suggestions = ref<AutocompletePrediction[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const hasInitialAddressFromProps = ref(false)

  const modelState = {
    searchInput,
    selectedAddress,
    suggestions,
    hasInitialAddressFromProps,
  }

  useAddressAutocompleteModelWatchers(options, getToken, modelState)

  const { fetchSuggestions } = useAddressAutocompleteSuggestions(
    {
      minInputLength: options.minInputLength,
      debounceMs: options.debounceMs,
    },
    sessionToken,
    { suggestions, isLoading, errorMessage }
  )

  const selection = useAddressAutocompleteSelection(
    options,
    { sessionToken, getToken, resetToken },
    {
      suggestions,
      selectedAddress,
      isLoading,
      errorMessage,
      hasInitialAddressFromProps,
    },
    fetchSuggestions
  )

  return {
    searchInput,
    selectedAddress,
    suggestions,
    isLoading,
    errorMessage,
    hasInitialAddressFromProps,
    fetchSuggestions,
    selectPlace: selection.selectPlace,
    clearSuggestions: selection.clearSuggestions,
    clearError: selection.clearError,
    clearInitialFromProps: selection.clearInitialFromProps,
    handleSearchUpdate: selection.handleSearchUpdate,
    handleSelectionChange: selection.handleSelectionChange,
  }
}
