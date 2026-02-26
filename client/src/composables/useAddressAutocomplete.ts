/**
 * Address autocomplete orchestration: suggestions fetch, place details, token management.
 * WHY: Data fetching and domain logic live in composables; components handle UI wiring only.
 * PATTERN: useAddressAutocomplete(options) returns reactive state and methods; component binds to template and emits.
 */

import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  fetchAutocompleteSuggestions,
  fetchPlaceDetails,
  type AutocompletePrediction,
  MapsApiError,
} from '@/services/mapsApiService'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import { createLogger } from '@/utils/logger'
import type {
  SelectionResult,
  UseAddressAutocompleteOptions,
  UseAddressAutocompleteReturn,
} from '@/types/addressAutocomplete'

export type { Coordinates, PlaceDetails, MapsApiError } from '@/services/mapsApiService'

const logger = createLogger('useAddressAutocomplete')

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

  watch(
    () => options.modelValue(),
    (newValue, oldValue) => {
      if (newValue && !selectedAddress.value) {
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

  const fetchSuggestionsDebounced = useDebounceFn(async (input: string) => {
    if (input.length < options.minInputLength()) {
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
  }, options.debounceMs())

  function fetchSuggestions(input: string): void {
    fetchSuggestionsDebounced(input)
  }

  function handleNullSelection(selection: AutocompletePrediction | null): SelectionResult | null {
    if (selection !== null) return null
    if (hasInitialAddressFromProps.value && options.modelValue()) {
      logger.debug('[selectPlace] Ignoring null selection - have initial address from props')
      return { kind: 'synthetic' }
    }
    selectedAddress.value = null
    hasInitialAddressFromProps.value = false
    return { kind: 'cleared' }
  }

  function handleSyntheticSelection(selection: AutocompletePrediction): boolean {
    if (!selection.placeId?.startsWith('synthetic-')) return false
    logger.debug('[selectPlace] Synthetic item selected, skipping API fetch')
    hasInitialAddressFromProps.value = true
    return true
  }

  async function selectPlace(selection: AutocompletePrediction | null): Promise<SelectionResult> {
    const nullResult = handleNullSelection(selection)
    if (nullResult) return nullResult

    const sel = selection as AutocompletePrediction
    logger.debug('[selectPlace] Selected:', sel.description)
    if (handleSyntheticSelection(sel)) return { kind: 'synthetic' }

    hasInitialAddressFromProps.value = false
    isLoading.value = true
    errorMessage.value = ''

    try {
      const details = await fetchPlaceDetails(sel.placeId, sessionToken.value)
      logger.debug('[selectPlace] Got coordinates:', details.coordinates)
      resetToken()
      await getToken()
      return {
        kind: 'place',
        description: sel.description,
        placeId: sel.placeId,
        coordinates: details.coordinates,
        details,
      }
    } catch (error) {
      logger.error('[selectPlace] Error fetching details:', error)
      if (error instanceof MapsApiError) {
        errorMessage.value = error.message
        return { kind: 'error', error }
      }
      errorMessage.value = 'Failed to fetch address details'
      return {
        kind: 'error',
        error: new MapsApiError('unknown', 'Failed to fetch address details'),
      }
    } finally {
      isLoading.value = false
    }
  }

  function clearSuggestions(): void {
    suggestions.value = []
  }

  function clearError(): void {
    errorMessage.value = ''
  }

  function clearInitialFromProps(): void {
    hasInitialAddressFromProps.value = false
  }

  async function handleSearchUpdate(value: string | null): Promise<void> {
    const input = value !== undefined && value !== null && value !== '' ? value : ''
    if (input.length >= options.minInputLength()) {
      try {
        await getToken()
        logger.debug('[handleSearchUpdate] Got session token (lazy-loaded)')
      } catch (error) {
        logger.warn('[handleSearchUpdate] Failed to get token:', error)
      }
    }
    if (!selectedAddress.value || selectedAddress.value.description !== input) {
      const isUserTyping = input !== options.modelValue()
      if (isUserTyping && options.emit) {
        clearInitialFromProps()
        options.emit['update:modelValue'](input)
        options.emit['update:coordinates'](undefined)
        options.emit['update:placeId'](undefined)
      }
    }
    if (input.length >= options.minInputLength()) {
      fetchSuggestions(input)
    } else {
      suggestions.value = []
    }
  }

  async function handleSelectionChange(selection: AutocompletePrediction | null): Promise<void> {
    const result = await selectPlace(selection)
    const emit = options.emit
    if (!emit) return
    if (result.kind === 'cleared') {
      emit['update:modelValue']('')
      emit['update:coordinates'](undefined)
      emit['update:placeId'](undefined)
      return
    }
    if (result.kind === 'synthetic') return
    if (result.kind === 'place') {
      emit['update:modelValue'](result.description)
      emit['update:placeId'](result.placeId)
      emit['update:coordinates'](result.coordinates)
      emit['place-selected'](result.details)
      return
    }
    emit.error(result.error)
    emit['update:coordinates'](undefined)
  }

  return {
    searchInput,
    selectedAddress,
    suggestions,
    isLoading,
    errorMessage,
    hasInitialAddressFromProps,
    fetchSuggestions,
    selectPlace,
    clearSuggestions,
    clearError,
    clearInitialFromProps,
    handleSearchUpdate,
    handleSelectionChange,
  }
}
