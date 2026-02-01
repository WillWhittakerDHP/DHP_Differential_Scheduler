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
 * Session 2.2.2: Added placeId prop for Routes API integration
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
 * Emits
 * LEARNING: Standard v-model pattern with additional events
 * Session 2.2.2: Added update:placeId for Routes API integration
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:coordinates': [value: Coordinates | undefined]
  /** Google Place ID for accurate routing (Session 2.2.2) */
  'update:placeId': [value: string | undefined]
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

// LEARNING: Track if we're showing an existing address from props (no prediction object)
// WHY: VAutocomplete with return-object emits null when there's no object, even if we have text
// PATTERN: Skip clearing the modelValue when we're just displaying existing text
const hasInitialAddressFromProps = ref(false)

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
 * Session 2.2.2: Create synthetic item for VAutocomplete to display existing address
 * 
 * WHY: VAutocomplete with return-object only displays items from its items array.
 * When loading an existing address, we need to create a "fake" prediction object
 * so VAutocomplete can display it properly.
 */
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue && !selectedAddress.value) {
      // Create a synthetic prediction object for the existing address
      // This allows VAutocomplete to display it properly
      const syntheticPrediction: AutocompletePrediction = {
        placeId: props.placeId || `synthetic-${Date.now()}`,
        description: newValue,
        mainText: newValue,
        secondaryText: ''
      }
      
      // Add to suggestions so VAutocomplete can find it
      suggestions.value = [syntheticPrediction]
      
      // Set as selected address
      selectedAddress.value = syntheticPrediction
      searchInput.value = newValue
      
      // Mark that we have an address from props (not from selection)
      hasInitialAddressFromProps.value = true
      logger.debug('[watch:modelValue] Created synthetic item for initial address:', newValue)
    }
    // If modelValue was externally cleared, reset our flag
    if (!newValue && oldValue) {
      hasInitialAddressFromProps.value = false
      selectedAddress.value = null
      suggestions.value = []
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
 * Session 2.2.2: Also clears placeId when user types new address
 */
const handleSearchUpdate = (value: string | null) => {
  const input = value || ''
  
  // If user is typing (not selecting), emit the raw value
  if (!selectedAddress.value || selectedAddress.value.description !== input) {
    // LEARNING: Only emit/clear if user is actually changing the text
    // WHY: Avoid clearing when component is just initializing with existing address
    const isUserTyping = input !== props.modelValue
    
    if (isUserTyping) {
      // User is typing something new - clear the initial-from-props flag
      hasInitialAddressFromProps.value = false
      emit('update:modelValue', input)
      // Clear coordinates and placeId when user is typing a new address
      emit('update:coordinates', undefined)
      emit('update:placeId', undefined)
    }
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
 * Session 2.2.2: Also emits placeId for Routes API integration
 */
const handleSelectionChange = async (selection: AutocompletePrediction | null) => {
  if (!selection) {
    // LEARNING: Don't clear the address if we're just loading from props
    // WHY: VAutocomplete with return-object emits null when there's no object
    // but we have an existing address from props that we want to keep
    if (hasInitialAddressFromProps.value && props.modelValue) {
      logger.debug('[handleSelectionChange] Ignoring null selection - have initial address from props')
      return
    }
    
    // User explicitly cleared the selection
    selectedAddress.value = null
    hasInitialAddressFromProps.value = false
    emit('update:modelValue', '')
    emit('update:coordinates', undefined)
    emit('update:placeId', undefined)
    return
  }
  
  logger.debug('[handleSelectionChange] Selected:', selection.description)
  
  // Check if this is a synthetic item (existing address from props)
  // Don't fetch details for synthetic items - we already have the data
  const isSyntheticItem = selection.placeId?.startsWith('synthetic-')
  if (isSyntheticItem) {
    logger.debug('[handleSelectionChange] Synthetic item selected, skipping API fetch')
    hasInitialAddressFromProps.value = true
    return
  }
  
  // User made a new selection, clear the initial-from-props flag
  hasInitialAddressFromProps.value = false
  
  // Update display immediately
  emit('update:modelValue', selection.description)
  
  // Emit placeId immediately (before fetching details)
  // LEARNING: placeId is available from autocomplete, no need to wait for details
  // WHY: Routes API prefers placeId for accurate routing
  emit('update:placeId', selection.placeId)
  
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
    // Note: placeId was already emitted above
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
