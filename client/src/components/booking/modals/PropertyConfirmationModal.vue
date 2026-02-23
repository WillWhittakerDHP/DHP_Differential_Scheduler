<!--
  LEARNING: Property Confirmation Modal Component
  WHY: Allows users to review property details before proceeding to next step
  PATTERN: VDialog with property details summary, Confirm/Edit buttons
-->
<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="600"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-h5">Confirm Property Details</span>
        <VBtn
          icon
          variant="text"
          @click="updateModelValue(false)"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <!-- LEARNING: Property Details Summary -->
        <!-- WHY: Displays all property information for user review -->
        <!-- PATTERN: VList with property details -->
        <VList>
          <!-- Property Type -->
          <VListSubheader class="text-h6 mb-2">Property Type</VListSubheader>
          <VListItem v-if="selectedPropertyTypes.length > 0">
            <VListItemTitle>
              {{ selectedPropertyTypes.map(pt => pt.name).join(', ') }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-else>
            <VListItemTitle class="text-medium-emphasis">No property type selected</VListItemTitle>
          </VListItem>

          <VDivider class="my-4" />

          <!-- Location -->
          <VListSubheader class="text-h6 mb-2">Location</VListSubheader>
          <VListItem>
            <VListItemTitle>
              {{ fullAddress }}
            </VListItemTitle>
          </VListItem>

          <VDivider class="my-4" />

          <!-- Property Details -->
          <VListSubheader class="text-h6 mb-2">Details</VListSubheader>
          <VListItem v-if="propertyDetails.propertySize">
            <VListItemTitle>
              Size: {{ propertyDetails.propertySize }} sq-ft
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.numberOfUnits">
            <VListItemTitle>
              Number of Units: {{ propertyDetails.numberOfUnits }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.mlsNumber">
            <VListItemTitle>
              MLS Number: {{ propertyDetails.mlsNumber }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.squareFootage">
            <VListItemTitle>
              Square Footage: {{ propertyDetails.squareFootage }} sq-ft
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.bedrooms !== null">
            <VListItemTitle>
              Bedrooms: {{ propertyDetails.bedrooms }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.bathrooms !== null">
            <VListItemTitle>
              Bathrooms: {{ propertyDetails.bathrooms }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-if="propertyDetails.foundationAccess">
            <VListItemTitle>
              Foundation Access: {{ formatFoundationAccess(propertyDetails.foundationAccess) }}
            </VListItemTitle>
          </VListItem>
        </VList>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="handleEdit"
        >
          Edit
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="handleConfirm"
        >
          Confirm
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

interface Props {
  modelValue: boolean
  propertyDetails: PropertyDetailsData
  selectedPropertyTypes: BookingBlockInstance[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'edit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * WHY: Combines address, unit, city, state, and zip code into readable format
P...
 */
const fullAddress = computed(() => {
  const parts: string[] = []
  
  if (props.propertyDetails.address) {
    parts.push(props.propertyDetails.address)
  }
  
  if (props.propertyDetails.unit) {
    parts.push(`Unit ${props.propertyDetails.unit}`)
  }
  
  const cityStateZip: string[] = []
  if (props.propertyDetails.city) {
    cityStateZip.push(props.propertyDetails.city)
  }
  if (props.propertyDetails.state) {
    cityStateZip.push(props.propertyDetails.state)
  }
  if (props.propertyDetails.zipCode) {
    cityStateZip.push(props.propertyDetails.zipCode)
  }
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '))
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No address provided'
})

function formatFoundationAccess(access: string): string {
  return access.charAt(0).toUpperCase() + access.slice(1)
}

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleConfirm(): void {
  emit('confirm')
  updateModelValue(false)
}

function handleEdit(): void {
  emit('edit')
  updateModelValue(false)
}
</script>

<style scoped lang="scss">
</style>
