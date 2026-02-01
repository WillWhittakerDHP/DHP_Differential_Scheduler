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
 * LEARNING: AddressAutocomplete Component
 * 
 * WHY: Provides Google Places address autocomplete with coordinate extraction.
 *      Essential for drive time calculations in Phase 2.2.
 * 
 * PATTERN: Uses VAutocomplete as base, integrates with mapsApiService
 * 
 * COMPARISON: Similar to Google Places Autocomplete widget but integrated
 *             with Vuetify styling and our API proxy for security.
 */

import { ref, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { 
  fetchAutocompleteSuggestions, 
  fetchPlaceDetails,
  getSessionToken,
  type AutocompletePrediction,
  type PlaceDetails,
  type Coordinates,
  MapsApiError
} from '@/services/mapsApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AddressAutocomplete')

/**
 * Props interface
 * LEARNING: Standard v-model pattern plus additional configuration
 */
interface Props {
  modelValue: string
  coordinates?: Coordinates
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
 * Emits
 * LEARNING: Standard v-model pattern with additional events
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:coordinates': [value: Coordinates | undefined]
  'place-selected': [details: PlaceDetails]
  'error': [error: MapsApiError]
}>()

// Local state
const searchInput = ref('')
const selectedAddress = ref<AutocompletePrediction | null>(null)
const suggestions = ref<AutocompletePrediction[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const sessionToken = ref<string>('')

/**
 * Initialize session token on mount
 * LEARNING: Session tokens optimize billing - one autocomplete session = one charge
 */
onMounted(async () => {
  try {
    sessionToken.value = await getSessionToken()
    logger.debug('[onMounted] Got session token')
  } catch (error) {
    logger.warn('[onMounted] Failed to get session token:', error)
    // Continue without session token - will work but may cost more
  }
})

/**
 * Sync initial value from prop
 * LEARNING: When modelValue is provided, show it in the input
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && !selectedAddress.value) {
      searchInput.value = newValue
    }
  },
  { immediate: true }
)

/**
 * Debounced function to fetch suggestions
 * LEARNING: Debounce prevents excessive API calls while typing
 * WHY: Google charges per autocomplete session, debounce reduces requests
 */
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

/**
 * Handle search input changes
 * LEARNING: Triggers debounced API call when user types
 */
const handleSearchUpdate = (value: string | null) => {
  const input = value || ''
  
  // If user is typing (not selecting), emit the raw value
  if (!selectedAddress.value || selectedAddress.value.description !== input) {
    emit('update:modelValue', input)
    // Clear coordinates when user is typing a new address
    emit('update:coordinates', undefined)
  }
  
  // Fetch suggestions
  if (input.length >= props.minInputLength) {
    fetchSuggestionsDebounced(input)
  } else {
    suggestions.value = []
  }
}

/**
 * Handle selection from dropdown
 * LEARNING: When user selects a suggestion, fetch full details
 */
const handleSelectionChange = async (selection: AutocompletePrediction | null) => {
  if (!selection) {
    // User cleared the selection
    selectedAddress.value = null
    emit('update:modelValue', '')
    emit('update:coordinates', undefined)
    return
  }
  
  logger.debug('[handleSelectionChange] Selected:', selection.description)
  
  // Update display immediately
  emit('update:modelValue', selection.description)
  
  // Fetch place details for coordinates
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const details = await fetchPlaceDetails(selection.placeId, sessionToken.value)
    
    logger.debug('[handleSelectionChange] Got coordinates:', details.coordinates)
    
    // Emit the coordinates
    emit('update:coordinates', details.coordinates)
    
    // Emit full details for consumers who need address components
    emit('place-selected', details)
    
    // Generate new session token for next autocomplete session
    // LEARNING: Session token is consumed after place-details call
    sessionToken.value = await getSessionToken()
    
  } catch (error) {
    logger.error('[handleSelectionChange] Error fetching details:', error)
    
    if (error instanceof MapsApiError) {
      errorMessage.value = error.message
      emit('error', error)
    } else {
      errorMessage.value = 'Failed to fetch address details'
    }
    
    // Still emit the address text even if coordinates failed
    emit('update:coordinates', undefined)
    
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle blur event
 * LEARNING: Clear error on blur if no input
 */
const handleBlur = () => {
  // Clear suggestions when leaving the field
  suggestions.value = []
  
  // Clear error if input is empty
  if (!searchInput.value) {
    errorMessage.value = ''
  }
}
</script>

<style scoped>
/* Component uses Vuetify's built-in styling */
</style>
