<!--
  LEARNING: Address Autocomplete Component
  WHY: Provides address suggestions with coordinate extraction for drive time calculations
  PATTERN: Vuetify VAutocomplete wrapper with Google Places API integration
  
  Session 2.2.1: Created for Google Maps API Integration
-->
<template>
  <VAutocomplete
    v-model="selectedAddress"
    v-model:search="searchInput"
    :items="suggestions"
    :loading="isLoading"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="!!hint"
    :error="!!errorMessage"
    :error-messages="errorMessage"
    :disabled="disabled"
    :clearable="clearable"
    item-title="description"
    item-value="placeId"
    return-object
    no-filter
    hide-no-data
    :menu-props="{ maxHeight: 300 }"
    @update:search="handleSearchUpdate"
    @update:model-value="handleSelectionChange"
    @blur="handleBlur"
  >
    <!-- Custom item template for better formatting -->
    <template #item="{ props: itemProps, item }">
      <VListItem v-bind="itemProps">
        <template #prepend>
          <VIcon size="small" class="me-2">mdi-map-marker</VIcon>
        </template>
        <VListItemTitle>{{ item.raw.mainText }}</VListItemTitle>
        <VListItemSubtitle>{{ item.raw.secondaryText }}</VListItemSubtitle>
      </VListItem>
    </template>
    
    <!-- Loading indicator -->
    <template #append-inner>
      <VProgressCircular
        v-if="isLoading"
        size="20"
        width="2"
        indeterminate
        color="primary"
      />
    </template>
    
    <!-- Prepend icon slot -->
    <template v-if="prependIcon" #prepend-inner>
      <VIcon>{{ prependIcon }}</VIcon>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
/**
 * 
 *      Essential for drive time calculations in Phase 2.2.
 * 
 * PATTERN: Uses VAutocomplete as base, integrates with mapsApiService
 * 
 *             with Vuetify styling and our API proxy for security.
 */

import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { 
  fetchAutocompleteSuggestions, 
  fetchPlaceDetails,
  type AutocompletePrediction,
  type PlaceDetails,
  type Coordinates,
  MapsApiError
} from '@/services/mapsApiService'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AddressAutocomplete')

// LEARNING: Use shared session token composable
const { token: sessionToken, getToken, resetToken } = useMapsSessionToken()

/**
LEARNING: Standard v-model pattern plus additional confi...
 */
interface Props {
  modelValue: string
  coordinates?: Coordinates
  /** Google Place ID for accurate routing (Session 2.2.2) */
  placeId?: string
  label?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
  clearable?: boolean
  prependIcon?: string
  /** Minimum characters before triggering autocomplete */
  minInputLength?: number
  /** Debounce delay in ms */
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  coordinates: undefined,
  placeId: undefined,
  label: 'Address',
  placeholder: 'Start typing an address...',
  hint: '',
  disabled: false,
  clearable: true,
  prependIcon: 'mdi-map-marker-outline',
  minInputLength: 3,
  debounceMs: 300
})

/**
LEARNING: Standard v-model pattern with additional events
Session ...
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:coordinates': [value: Coordinates | undefined]
  /** Google Place ID for accurate routing (Session 2.2.2) */
  'update:placeId': [value: string | undefined]
  'place-selected': [details: PlaceDetails]
  'error': [error: MapsApiError]
}>()

const searchInput = ref('')
const selectedAddress = ref<AutocompletePrediction | null>(null)
const suggestions = ref<AutocompletePrediction[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const hasInitialAddressFromProps = ref(false)

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue && !selectedAddress.value) {
      const syntheticPrediction: AutocompletePrediction = {
        placeId: props.placeId || `synthetic-${Date.now()}`,
        description: newValue,
        mainText: newValue,
        secondaryText: ''
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
  if (input.length < props.minInputLength) {
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
      emit('error', error)
    } else {
      errorMessage.value = 'Failed to fetch suggestions'
    }
    
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}, props.debounceMs)

const handleSearchUpdate = async (value: string | null) => {
  const input = value !== undefined && value !== null && value !== '' ? value : ''

  if (!sessionToken.value && input.length >= props.minInputLength) {
    try {
      await getToken()
      logger.debug('[handleSearchUpdate] Got session token (lazy-loaded)')
    } catch (error) {
      logger.warn('[handleSearchUpdate] Failed to get token:', error)
    }
  }
  
  if (!selectedAddress.value || selectedAddress.value.description !== input) {
    const isUserTyping = input !== props.modelValue
    
    if (isUserTyping) {
      hasInitialAddressFromProps.value = false
      emit('update:modelValue', input)
      emit('update:coordinates', undefined)
      emit('update:placeId', undefined)
    }
  }
  
  if (input.length >= props.minInputLength) {
    fetchSuggestionsDebounced(input)
  } else {
    suggestions.value = []
  }
}

/** Handle null selection: keep initial-from-props or clear and emit. Returns true if caller should return. */
function handleNullSelection(
  selection: AutocompletePrediction | null,
  emit: (e: string, ...args: unknown[]) => void,
  hasInitialAddressFromProps: { value: boolean },
  modelValue: string | null,
  selectedAddress: { value: AutocompletePrediction | null }
): boolean {
  if (selection !== null) return false
  if (hasInitialAddressFromProps.value && modelValue) {
    logger.debug('[handleSelectionChange] Ignoring null selection - have initial address from props')
    return true
  }
  selectedAddress.value = null
  hasInitialAddressFromProps.value = false
  emit('update:modelValue', '')
  emit('update:coordinates', undefined)
  emit('update:placeId', undefined)
  return true
}

/** Handle synthetic item (existing address from props). Returns true if caller should return. */
function handleSyntheticSelection(
  selection: AutocompletePrediction,
  hasInitialAddressFromProps: { value: boolean }
): boolean {
  if (!selection.placeId?.startsWith('synthetic-')) return false
  logger.debug('[handleSelectionChange] Synthetic item selected, skipping API fetch')
  hasInitialAddressFromProps.value = true
  return true
}

const handleSelectionChange = async (selection: AutocompletePrediction | null) => {
  if (handleNullSelection(selection, emit as (e: string, ...args: unknown[]) => void, hasInitialAddressFromProps, props.modelValue, selectedAddress)) return
  const sel = selection as AutocompletePrediction
  logger.debug('[handleSelectionChange] Selected:', sel.description)
  if (handleSyntheticSelection(sel, hasInitialAddressFromProps)) return

  hasInitialAddressFromProps.value = false
  emit('update:modelValue', sel.description)
  emit('update:placeId', sel.placeId)
  isLoading.value = true
  errorMessage.value = ''

  try {
    const details = await fetchPlaceDetails(sel.placeId, sessionToken.value)
    logger.debug('[handleSelectionChange] Got coordinates:', details.coordinates)
    emit('update:coordinates', details.coordinates)
    emit('place-selected', details)
    resetToken()
    await getToken()
  } catch (error) {
    logger.error('[handleSelectionChange] Error fetching details:', error)
    if (error instanceof MapsApiError) {
      errorMessage.value = error.message
      emit('error', error)
    } else {
      errorMessage.value = 'Failed to fetch address details'
    }
    emit('update:coordinates', undefined)
  } finally {
    isLoading.value = false
  }
}

const handleBlur = () => {
  suggestions.value = []
  
  if (!searchInput.value) {
    errorMessage.value = ''
  }
}
</script>

<style scoped>
</style>
