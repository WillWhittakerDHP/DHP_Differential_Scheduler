<!-- Extracted Details section from PropertyDetailsStep for component-health (allowlist repair). -->
<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <VRow class="mt-5">
    <VCol cols="12">
      <h5 class="text-headline-medium mb-4">Details</h5>
      <VProgressLinear
        v-if="isEnrichmentLoading"
        indeterminate
        color="primary"
        class="mb-4"
      />
    </VCol>

    <VCol cols="12">
      <VAlert
        v-if="propertyTypesCascadeError"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ propertyTypesCascadeError }}
      </VAlert>
    </VCol>

    <VCol cols="12" class="details-selects-col">
      <VRow>
        <VCol
          :cols="showComponents ? 12 : 12"
          :sm="showComponents ? 6 : 12"
          :md="showComponents ? 5 : 12"
          class="property-type-col"
        >
          <div
            class="property-type-select-wrap"
            :style="{ width: propertyTypeSelectWidthPx + 'px' }"
          >
            <WizardSelect
              :model-value="selectedPropertyTypeId"
              :items="availablePropertyTypes"
              item-title="name"
              item-value="id"
              label="Property Type"
              :field-errors="fieldErrors"
              error-key="propertyTypeBlock"
              required
              class="mb-4"
              @update:model-value="emit('update:selectedPropertyTypeId', $event as string | null)"
            />
          </div>
        </VCol>
        <VCol
          v-if="showComponents"
          cols="12"
          sm="6"
          md="7"
        >
          <WizardSelect
            v-model="selectedComponentIds"
            :items="activeInstanceComponents"
            item-title="name"
            item-value="id"
            label="Components"
            multiple
            chips
            class="mb-4"
          />
        </VCol>
      </VRow>
    </VCol>

    <VCol cols="12" class="details-fields-col">
      <VRow>
        <VCol cols="12" sm="6" md="5">
          <WizardTextField
            v-model.number="formData.propertySize.value"
            label="Size"
            type="number"
            placeholder="800"
            :rules="validationRules.propertySize"
            :field-errors="fieldErrors"
            error-key="propertySize"
            :hint="squareFootageHint"
            persistent-hint
            required
          >
            <template #append-inner>
              <span class="text-body-medium text-medium-emphasis">sq-ft</span>
            </template>
          </WizardTextField>
        </VCol>

        <template
          v-if="formData.mlsNumber.value || formData.squareFootage.value || formData.bedrooms.value !== null || formData.bathrooms.value !== null || formData.foundationAccess.value"
        >
          <VCol v-if="formData.mlsNumber.value" cols="12" sm="6" md="5">
            <VTextField
              v-model="formData.mlsNumber.value"
              label="MLS Number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.bedrooms.value !== null" cols="12" sm="4" md="3">
            <VTextField
              v-model.number="formData.bedrooms.value"
              label="Bedrooms"
              type="number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.bathrooms.value !== null" cols="12" sm="4" md="3">
            <VTextField
              v-model.number="formData.bathrooms.value"
              label="Bathrooms"
              type="number"
              readonly
              full-width
            />
          </VCol>
          <VCol v-if="formData.foundationAccess.value" cols="12" sm="6" md="5">
            <VTextField
              :model-value="foundationAccessDisplayValue"
              label="Foundation Access"
              readonly
              full-width
            />
          </VCol>
        </template>

        <VCol v-if="isMultiFamily" cols="12" sm="6" md="5">
          <WizardTextField
            v-model.number="formData.numberOfUnits.value"
            label="Number of Units"
            type="number"
            placeholder="0"
            :rules="validationRules.numberOfUnits"
            :field-errors="fieldErrors"
            error-key="numberOfUnits"
            required
          />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import WizardTextField from '@/components/booking/fields/WizardTextField.vue'
import WizardSelect from '@/components/booking/fields/WizardSelect.vue'
import { measureMaxTextWidth } from '@/utils/dom/textMeasure'
import type { PropertyFormData } from '@/types/propertyForm'
import type { ValidationRule } from '@/types/formValidation'
import type { BookingBlockInstance } from '@/types/transformers/bookingData'
import type { ComponentItem } from '@/components/booking/types/selectionCardTypes'

/** Padding for VSelect: dropdown icon + field padding so width fits content, not full column */
const SELECT_PADDING_PX = 56
const MIN_PROPERTY_TYPE_WIDTH_PX = 160

export type PropertyTypeWithComponents = BookingBlockInstance & {
  composite?: boolean
  instanceComponents?: ComponentItem[]
}

const props = defineProps<{
  selectedPropertyTypeId: string | null
  availablePropertyTypes: PropertyTypeWithComponents[]
  propertyTypesCascadeError: string | null
  formData: PropertyFormData
  validationRules: { propertySize: ValidationRule[]; numberOfUnits: ValidationRule[] }
  fieldErrors: Record<string, string>
  isMultiFamily: boolean
  isEnrichmentLoading: boolean
  squareFootageHint: string | undefined
  foundationAccessDisplayValue: string
}>()

const emit = defineEmits<{
  'update:selectedPropertyTypeId': [value: string | null]
}>()

const selectedComponentIds = ref<string[]>([])

const selectedPropertyType = computed((): PropertyTypeWithComponents | undefined => {
  if (!props.selectedPropertyTypeId) return undefined
  return props.availablePropertyTypes.find(p => p.id === props.selectedPropertyTypeId)
})

const showComponents = computed(
  () =>
    selectedPropertyType.value?.composite === true && activeInstanceComponents.value.length > 0
)

const activeInstanceComponents = computed((): ComponentItem[] => {
  const comps = selectedPropertyType.value?.instanceComponents
  if (!comps) return []
  return comps.filter((c: ComponentItem) => c.active === true)
})

const propertyTypeSelectWidthPx = ref(MIN_PROPERTY_TYPE_WIDTH_PX)
watch(
  () => props.availablePropertyTypes,
  (list) => {
    const labels = (list ?? []).map((i) => i.name).filter(Boolean) as string[]
    if (labels.length === 0) {
      propertyTypeSelectWidthPx.value = MIN_PROPERTY_TYPE_WIDTH_PX
      return
    }
    const textWidth = measureMaxTextWidth(labels)
    propertyTypeSelectWidthPx.value = Math.max(
      MIN_PROPERTY_TYPE_WIDTH_PX,
      textWidth + SELECT_PADDING_PX
    )
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.details-selects-col,
.details-fields-col {
  max-width: 32rem; /* Reasonably wide, not full line; leaves room for Components on same row */
}

/* Property Type select only as wide as needed for options, not full column */
.property-type-col {
  width: fit-content;
  max-width: 100%;
}

.property-type-select-wrap {
  /* Width set inline from measureMaxTextWidth(option names) + padding */
  min-width: 0;
}
</style>
