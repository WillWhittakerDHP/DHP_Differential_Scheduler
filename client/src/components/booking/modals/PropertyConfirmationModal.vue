<!--
  WHY: Allows users to review property details before proceeding to next step
  PATTERN: Uses RequiredConfirmationModal shell; property summary in body slot; dynamic title (e.g. "Confirm {name} details").
-->
<template>
  <RequiredConfirmationModal
    :model-value="modelValue"
    :title="confirmationTitle"
    primary-label="Confirm"
    secondary-label="Edit"
    @update:model-value="updateModelValue"
    @confirm="handleConfirm"
    @cancel="handleEdit"
  >
    <!-- WHY: Displays all property information for user review -->
    <!-- PATTERN: VList with property details -->
    <VList>
          <!-- Property Type -->
          <VListSubheader class="text-headline-small mb-2">Property Type</VListSubheader>
          <VListItem v-if="selectedPropertyTypes.length > 0">
            <VListItemTitle>
              {{ propertyTypesLabel }}
            </VListItemTitle>
          </VListItem>
          <VListItem v-else>
            <VListItemTitle class="text-medium-emphasis">No property type selected</VListItemTitle>
          </VListItem>

          <VDivider class="my-4" />

          <!-- Location -->
          <VListSubheader class="text-headline-small mb-2">Location</VListSubheader>
          <VListItem>
            <VListItemTitle>
              {{ fullAddress }}
            </VListItemTitle>
          </VListItem>

          <VDivider class="my-4" />

          <!-- Property Details -->
          <VListSubheader class="text-headline-small mb-2">Details</VListSubheader>
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
  </RequiredConfirmationModal>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { usePropertyTypesLabel } from '@/composables/booking/usePropertyTypesLabel'
import type { PropertyDetailsData } from '@/types/propertyForm'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import RequiredConfirmationModal from '@/components/booking/modals/RequiredConfirmationModal.vue'

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

const { propertyTypesLabel } = usePropertyTypesLabel(toRef(props, 'selectedPropertyTypes'))

/** Dynamic title (e.g. "Confirm Report Writing details" or "Confirm Property Details"). */
const confirmationTitle = computed(() => {
  const first = props.selectedPropertyTypes[0]
  const name = first?.name
  if (name) return `Confirm ${name} details`
  return 'Confirm Property Details'
})

/**
 * WHY: Combines address, unit, city, state, and zip code into readable format.
 * Task 6.4.4.2: PropertyConfirmationModal uses RequiredConfirmationModal shell; dynamic title in confirmationTitle.
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
