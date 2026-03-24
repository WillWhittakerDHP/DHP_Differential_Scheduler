/**
 * Debounced Maps autocomplete suggestions fetch; owns loading/error state for the suggestion list.
 * WHY: Splits query traffic from selection and model-sync logic (composables-logic split_candidate).
 */
import { type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { fetchAutocompleteSuggestions, MapsApiError, type AutocompletePrediction } from '@/services/mapsApiService'
import type { UseAddressAutocompleteSuggestionsParams } from '@/types/addressAutocomplete'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAddressAutocompleteSuggestions')

interface UseAddressAutocompleteSuggestionsState {
  suggestions: Ref<AutocompletePrediction[]>
  isLoading: Ref<boolean>
  errorMessage: Ref<string>
}

export function useAddressAutocompleteSuggestions(
  params: UseAddressAutocompleteSuggestionsParams,
  sessionToken: Ref<string>,
  state: UseAddressAutocompleteSuggestionsState
): { fetchSuggestions: (input: string) => void } {
  const { suggestions, isLoading, errorMessage } = state

  const fetchSuggestionsDebounced = useDebounceFn(async (input: string) => {
    if (input.length < params.minInputLength()) {
      suggestions.value = []
      return
    }
    isLoading.value = true
    errorMessage.value = ''
    try {
      const results = await fetchAutocompleteSuggestions(input, sessionToken.value)
      suggestions.value = results
      logger.debug('[fetchSuggestions] Got', results.length, 'suggestions')
    } catch (error) {
      logger.error('[fetchSuggestions] Error:', error)
      if (error instanceof MapsApiError) {
        errorMessage.value = error.message
      } else {
        errorMessage.value = 'Failed to fetch suggestions'
      }
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }, params.debounceMs())

  function fetchSuggestions(input: string): void {
    fetchSuggestionsDebounced(input)
  }

  return { fetchSuggestions }
}
