<!-- Extracted from PropertiesTable for component-health (allowlist repair). -->
<!-- eslint-disable vue/no-mutating-props -- newProperty is a Ref passed by parent for two-way binding -->
<script setup lang="ts">
import type { Ref } from 'vue'
import type { PropertyRequest } from '@/types/property'
import { usePropertyCreateForm } from '@/composables/admin/usePropertyCreateForm'

const props = defineProps<{
  newProperty: Ref<PropertyRequest | Partial<PropertyRequest>>
}>()

defineEmits<{ (e: 'cancel'): void; (e: 'save'): void }>()

const form = usePropertyCreateForm(props.newProperty)
</script>

<template>
  <VCard class="mb-4">
    <VCardTitle>Create New Property</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="form.address"
            label="Address *"
            required
            @update:model-value="form.setAddress"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="form.unit"
            label="Unit"
            @update:model-value="form.setUnit"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="form.city"
            label="City *"
            required
            @update:model-value="form.setCity"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="form.state"
            label="State *"
            required
            @update:model-value="form.setState"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="form.zipCode"
            label="Zip Code *"
            required
            @update:model-value="form.setZipCode"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="form.squareFootage"
            type="number"
            label="Square Footage"
            @update:model-value="form.setSquareFootage"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="form.mlsNumber"
            label="MLS Number"
            @update:model-value="form.setMlsNumber"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="form.bedrooms"
            type="number"
            label="Bedrooms"
            @update:model-value="form.setBedrooms"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            :model-value="form.bathrooms"
            type="number"
            label="Bathrooms"
            @update:model-value="form.setBathrooms"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VSelect
            :model-value="String(form.foundationAccess)"
            :items="['basement', 'crawlspace', 'slab']"
            label="Foundation Access"
            clearable
            @update:model-value="form.setFoundationAccess"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            :model-value="form.additionalUnits"
            type="number"
            label="Additional Units"
            @update:model-value="form.setAdditionalUnits"
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
