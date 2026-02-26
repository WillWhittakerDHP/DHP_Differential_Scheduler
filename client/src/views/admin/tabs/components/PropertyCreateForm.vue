<!-- Extracted from PropertiesTable for component-health (allowlist repair). -->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { PropertyRequest } from '@/types/property'
import { asEmptyString } from '@/utils/safeDefaults'

const props = defineProps<{
  newProperty: Ref<PropertyRequest | Partial<PropertyRequest>>
}>()

defineEmits<{ (e: 'cancel'): void; (e: 'save'): void }>()

const address = computed(() => asEmptyString(props.newProperty?.value?.address))
const unit = computed(() => asEmptyString(props.newProperty?.value?.unit))
const city = computed(() => asEmptyString(props.newProperty?.value?.city))
const state = computed(() => asEmptyString(props.newProperty?.value?.state))
const zipCode = computed(() => asEmptyString(props.newProperty?.value?.zipCode))
const squareFootage = computed(() => props.newProperty?.value?.squareFootage ?? undefined)
const mlsNumber = computed(() => asEmptyString(props.newProperty?.value?.mlsNumber))
const bedrooms = computed(() => props.newProperty?.value?.bedrooms ?? undefined)
const bathrooms = computed(() => props.newProperty?.value?.bathrooms ?? undefined)
const foundationAccess = computed(() => props.newProperty?.value?.foundationAccess ?? undefined)
const additionalUnits = computed(() => props.newProperty?.value?.additionalUnits ?? undefined)

function setAddress(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.address = v
}
function setUnit(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.unit = v
}
function setCity(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.city = v
}
function setState(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.state = v
}
function setZipCode(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.zipCode = v
}
function setSquareFootage(v: number | string | null): void {
  if (props.newProperty?.value) props.newProperty.value.squareFootage = v != null ? Number(v) : undefined
}
function setMlsNumber(v: string): void {
  if (props.newProperty?.value) props.newProperty.value.mlsNumber = v
}
function setBedrooms(v: number | string | null): void {
  if (props.newProperty?.value) props.newProperty.value.bedrooms = v != null ? Number(v) : undefined
}
function setBathrooms(v: number | string | null): void {
  if (props.newProperty?.value) props.newProperty.value.bathrooms = v != null ? Number(v) : undefined
}
function setFoundationAccess(v: string | null): void {
  if (props.newProperty?.value) props.newProperty.value.foundationAccess = v ?? undefined
}
function setAdditionalUnits(v: number | string | null): void {
  if (props.newProperty?.value) props.newProperty.value.additionalUnits = v != null ? Number(v) : undefined
}
</script>

<template>
  <VCard class="mb-4">
    <VCardTitle>Create New Property</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="address"
            label="Address *"
            required
            @update:model-value="setAddress"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="unit"
            label="Unit"
            @update:model-value="setUnit"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="city"
            label="City *"
            required
            @update:model-value="setCity"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="state"
            label="State *"
            required
            @update:model-value="setState"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="zipCode"
            label="Zip Code *"
            required
            @update:model-value="setZipCode"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="squareFootage"
            type="number"
            label="Square Footage"
            @update:model-value="setSquareFootage"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="mlsNumber"
            label="MLS Number"
            @update:model-value="setMlsNumber"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="bedrooms"
            type="number"
            label="Bedrooms"
            @update:model-value="setBedrooms"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="bathrooms"
            type="number"
            label="Bathrooms"
            @update:model-value="setBathrooms"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VSelect
            :model-value="foundationAccess"
            :items="['basement', 'crawlspace', 'slab']"
            label="Foundation Access"
            clearable
            @update:model-value="setFoundationAccess"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="additionalUnits"
            type="number"
            label="Additional Units"
            @update:model-value="setAdditionalUnits"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn variant="text" @click="$emit('cancel')">Cancel</VBtn>
      <VBtn color="primary" @click="$emit('save')">Save</VBtn>
    </VCardActions>
  </VCard>
</template>
