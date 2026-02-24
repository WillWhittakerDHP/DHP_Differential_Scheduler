<!--
  LEARNING: Address Autocomplete Component
  WHY: Provides address suggestions with coordinate extraction for drive time calculations
  PATTERN: Vuetify VAutocomplete wrapper; orchestration in useAddressAutocomplete composable
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
    <template #item="{ props: itemProps, item }">
      <VListItem v-bind="itemProps">
        <template #prepend>
          <VIcon size="small" class="me-2">mdi-map-marker</VIcon>
        </template>
        <VListItemTitle>{{ item.raw.mainText }}</VListItemTitle>
        <VListItemSubtitle>{{ item.raw.secondaryText }}</VListItemSubtitle>
      </VListItem>
    </template>
    <template #append-inner>
      <VProgressCircular
        v-if="isLoading"
        size="20"
        width="2"
        indeterminate
        color="primary"
      />
    </template>
    <template v-if="prependIcon" #prepend-inner>
      <VIcon>{{ prependIcon }}</VIcon>
    </template>
  </VAutocomplete>
</template>

<script setup lang="ts">
import { useAddressAutocomplete } from '@/composables/useAddressAutocomplete'
import { useMapsSessionToken } from '@/composables/useMapsSessionToken'
import { createLogger } from '@/utils/logger'
import {
  MapsApiError,
  type AutocompletePrediction,
  type Coordinates,
  type PlaceDetails,
} from '@/services/mapsApiService'

const logger = createLogger('AddressAutocomplete')
const { getToken } = useMapsSessionToken()

interface Props {
  modelValue: string
  coordinates?: Coordinates
  placeId?: string
  label?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
  clearable?: boolean
  prependIcon?: string
  minInputLength?: number
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
  debounceMs: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:coordinates': [value: Coordinates | undefined]
  'update:placeId': [value: string | undefined]
  'place-selected': [details: PlaceDetails]
  'error': [error: MapsApiError]
}>()

const {
  searchInput,
  selectedAddress,
  suggestions,
  isLoading,
  errorMessage,
  fetchSuggestions,
  selectPlace,
  clearSuggestions,
  clearError,
  clearInitialFromProps,
} = useAddressAutocomplete({
  modelValue: () => props.modelValue,
  placeId: () => props.placeId,
  minInputLength: () => props.minInputLength,
  debounceMs: () => props.debounceMs,
})

const handleSearchUpdate = async (value: string | null): Promise<void> => {
  const input = value !== undefined && value !== null && value !== '' ? value : ''
  if (input.length >= props.minInputLength) {
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
      clearInitialFromProps()
      emit('update:modelValue', input)
      emit('update:coordinates', undefined)
      emit('update:placeId', undefined)
    }
  }
  if (input.length >= props.minInputLength) {
    fetchSuggestions(input)
  } else {
    suggestions.value = []
  }
}

const handleSelectionChange = async (selection: AutocompletePrediction | null): Promise<void> => {
  const result = await selectPlace(selection)
  if (result.kind === 'cleared') {
    emit('update:modelValue', '')
    emit('update:coordinates', undefined)
    emit('update:placeId', undefined)
    return
  }
  if (result.kind === 'synthetic') return
  if (result.kind === 'place') {
    emit('update:modelValue', result.description)
    emit('update:placeId', result.placeId)
    emit('update:coordinates', result.coordinates)
    emit('place-selected', result.details)
    return
  }
  emit('error', result.error)
  emit('update:coordinates', undefined)
}

const handleBlur = (): void => {
  clearSuggestions()
  if (!searchInput.value) clearError()
}
</script>

<style scoped>
</style>
