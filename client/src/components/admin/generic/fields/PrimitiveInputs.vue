<template>
  <div>
    <!-- LEARNING: Check renderAs from metadata to determine which input to render -->
    <!-- WHY: renderAs is the source of truth for rendering - component dispatcher already determined this is primitive -->
    <!-- PATTERN: Use renderAs to determine TextInput vs BooleanInput, fieldType for other types -->
    <!-- Text Input (renderAs: 'text' or fieldType: 'text') -->
    <TextInput
      v-if="renderAs === 'text' || (fieldType === 'text' && renderAs !== 'statusButton')"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Number Input -->
    <NumberInput
      v-else-if="fieldType === 'number'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Boolean Input (renderAs: 'statusButton' or fieldType: 'boolean') -->
    <!-- Note: renderAs can be 'text' for text inputs, but if fieldType is 'boolean', it's a boolean field -->
    <BooleanInput
      v-else-if="renderAs === 'statusButton' || fieldType === 'boolean'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Date Input -->
    <DateInput
      v-else-if="fieldType === 'date'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Textarea Input -->
    <TextAreaInput
      v-else-if="fieldType === 'textarea'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Unknown Input Type -->
    <div v-else class="input-error">
      Unknown input type: {{ fieldType }} (renderAs: {{ renderAs }})
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LEARNING: PrimitiveInputs component renders primitive input components
 * 
 * WHY: Different field types need different input components
 * 
 * PATTERN: Factory pattern - determines field type and renders appropriate input component
 * 
 * COMPARISON: React uses switch statements in render functions. Vue uses v-if directives
 *             in templates. Both provide same functionality.
 */

import { computed } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import TextInput from './TextInput.vue'
import NumberInput from './NumberInput.vue'
import BooleanInput from './BooleanInput.vue'
import DateInput from './DateInput.vue'
import TextAreaInput from './TextAreaInput.vue'

import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const fieldType = computed(() => {
  // PATTERN: Fail explicitly if fieldType is missing - no fallbacks
  if (!props.fieldContext.displayConfig.fieldType) {
    throw new Error(
      `[PrimitiveInputs] Missing fieldType in displayConfig for field ${String(props.fieldContext.fieldKey)}. ` +
      `Field must be configured in /admin-input-metadata.`
    )
  }
  return props.fieldContext.displayConfig.fieldType
})

// PATTERN: Composable handles both temporary and existing entities
const entityForMetadata = useFieldContextMetadataEntity(props.fieldContext)

const fetchedMetadata = useEntityMetadata(
  props.fieldContext.entityKey,
  entityForMetadata
)

const renderAs = computed<FieldMetadataEntry['renderAs'] | undefined>(() => {
  const metadata = fetchedMetadata.fieldMetadata.value
  const fieldKeyStr = String(props.fieldContext.fieldKey)
  const meta = metadata[fieldKeyStr]
  return meta?.renderAs
})
</script>

<style scoped>
.input-error {
  padding: 8px;
  background-color: #fff2e8;
  border: 1px dashed #ffbb96;
  border-radius: 4px;
  font-size: 12px;
  color: #d4380d;
}
</style>

