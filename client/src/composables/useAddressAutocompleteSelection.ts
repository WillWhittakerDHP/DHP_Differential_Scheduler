/**
 * Place selection, search box updates, and v-model emit wiring for address autocomplete.
 * WHY: Keeps async selection + emit orchestration separate from suggestion fetch and model watches.
 */
import { type Ref } from 'vue'
import { fetchPlaceDetails, MapsApiError, type AutocompletePrediction } from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'
import type { SelectionResult, UseAddressAutocompleteOptions } from '@/types/addressAutocomplete'

const logger = createLogger('useAddressAutocompleteSelection')

interface UseAddressAutocompleteSelectionRefs {
  suggestions: Ref<AutocompletePrediction[]>
  selectedAddress: Ref<AutocompletePrediction | null>
  isLoading: Ref<boolean>
  errorMessage: Ref<string>
  hasInitialAddressFromProps: Ref<boolean>
}

interface UseAddressAutocompleteSelectionMapsSession {
  sessionToken: Ref<string>
  getToken: () => Promise<string>
  resetToken: () => void
}

export function useAddressAutocompleteSelection(
  options: UseAddressAutocompleteOptions,
  mapsSession: UseAddressAutocompleteSelectionMapsSession,
  refs: UseAddressAutocompleteSelectionRefs,
  fetchSuggestions: (input: string) => void
): {
  selectPlace: (selection: AutocompletePrediction | null) => Promise<SelectionResult>
  clearSuggestions: () => void
  clearError: () => void
  clearInitialFromProps: () => void
  handleSearchUpdate: (value: string | null) => Promise<void>
  handleSelectionChange: (selection: AutocompletePrediction | null) => Promise<void>
} {
  const { sessionToken, getToken, resetToken } = mapsSession
  const { suggestions, selectedAddress, isLoading, errorMessage, hasInitialAddressFromProps } = refs

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
    selectPlace,
    clearSuggestions,
    clearError,
    clearInitialFromProps,
    handleSearchUpdate,
    handleSelectionChange,
  }
}
