<!--
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
    persistent-placeholder
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
        <VListItemTitle>{{ item.mainText }}</VListItemTitle>
        <VListItemSubtitle>{{ item.secondaryText }}</VListItemSubtitle>
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
import { useAddressAutocomplete, type Coordinates, type PlaceDetails, type MapsApiError } from '@/composables/useAddressAutocomplete'

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
  clearSuggestions,
  clearError,
  handleSearchUpdate,
  handleSelectionChange,
} = useAddressAutocomplete({
  modelValue: () => props.modelValue,
  placeId: () => props.placeId,
  minInputLength: () => props.minInputLength,
  debounceMs: () => props.debounceMs,
  emit: {
    'update:modelValue': (v) => emit('update:modelValue', v),
    'update:coordinates': (v) => emit('update:coordinates', v),
    'update:placeId': (v) => emit('update:placeId', v),
    'place-selected': (d) => emit('place-selected', d),
    error: (e) => emit('error', e),
  },
})

function handleBlur(): void {
  clearSuggestions()
  if (!searchInput.value) clearError()
}
</script>

<style scoped>
</style>
