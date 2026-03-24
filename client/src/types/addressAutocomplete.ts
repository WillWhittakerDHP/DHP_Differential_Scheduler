import type { Ref } from 'vue'
import type { AutocompletePrediction, Coordinates, PlaceDetails } from '@/services/mapsApiService'
import type { MapsApiError } from '@/services/mapsApiService'

export type SelectionResult =
  | { kind: 'cleared' }
  | { kind: 'synthetic' }
  | { kind: 'place'; description: string; placeId: string; coordinates?: Coordinates; details: PlaceDetails }
  | { kind: 'error'; error: MapsApiError }

/** Optional emit callbacks so composable can drive handlers without async in component. */
export interface UseAddressAutocompleteEmit {
  'update:modelValue': (value: string) => void
  'update:coordinates': (value: Coordinates | undefined) => void
  'update:placeId': (value: string | undefined) => void
  'place-selected': (details: PlaceDetails) => void
  error: (error: MapsApiError) => void
}

export interface UseAddressAutocompleteOptions {
  modelValue: () => string
  placeId: () => string | undefined
  minInputLength: () => number
  debounceMs: () => number
  /** When provided, composable returns handleSearchUpdate and handleSelectionChange that invoke these. */
  emit?: UseAddressAutocompleteEmit
}

/** Subset for debounced suggestions only (type-similarity EXTEND). */
export type UseAddressAutocompleteSuggestionsParams = Pick<
  UseAddressAutocompleteOptions,
  'minInputLength' | 'debounceMs'
>

export interface UseAddressAutocompleteReturn {
  searchInput: Ref<string>
  selectedAddress: Ref<AutocompletePrediction | null>
  suggestions: Ref<AutocompletePrediction[]>
  isLoading: Ref<boolean>
  errorMessage: Ref<string>
  hasInitialAddressFromProps: Ref<boolean>
  fetchSuggestions: (input: string) => void
  selectPlace: (selection: AutocompletePrediction | null) => Promise<SelectionResult>
  clearSuggestions: () => void
  clearError: () => void
  clearInitialFromProps: () => void
  handleSearchUpdate: (value: string | null) => Promise<void>
  handleSelectionChange: (selection: AutocompletePrediction | null) => Promise<void>
}
