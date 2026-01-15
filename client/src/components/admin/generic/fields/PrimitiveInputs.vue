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
    
    <!-- Boolean Input (renderAs: 'statusButton' or fieldType: 'boolean' without explicit text renderAs) -->
    <BooleanInput
      v-else-if="renderAs === 'statusButton' || (fieldType === 'boolean' && renderAs !== 'text')"
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
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useAdmin } from '@/composables/useAdmin'
import TextInput from './TextInput.vue'
import NumberInput from './NumberInput.vue'
import BooleanInput from './BooleanInput.vue'
import DateInput from './DateInput.vue'
import TextAreaInput from './TextAreaInput.vue'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

// LEARNING: Determine field type from displayConfig (which comes from dataType only)
// WHY: displayConfig.fieldType is set from metadata dataType - renderAs is checked separately
// PATTERN: Use displayConfig.fieldType for data type, check renderAs from metadata for rendering
const fieldType = computed(() => {
  // LEARNING: displayConfig.fieldType is set from metadata dataType in useFormFieldsContext
  // WHY: Metadata is the source of truth for field rendering
  // PATTERN: Fail explicitly if fieldType is missing - no fallbacks
  if (!props.fieldContext.displayConfig.fieldType) {
    throw new Error(
      `[PrimitiveInputs] Missing fieldType in displayConfig for field ${String(props.fieldContext.fieldKey)}. ` +
      `Field must be configured in /admin-input-metadata.`
    )
  }
  return props.fieldContext.displayConfig.fieldType
})

// LEARNING: Get renderAs from metadata to determine rendering
// WHY: renderAs determines how to render (text input vs status button), not fieldType
// PATTERN: Fetch metadata and read renderAs - component dispatcher already determined this is primitive
const admin = useAdmin()
const entityForMetadata = computed(() => {
  if (!props.fieldContext.entityKey || !props.fieldContext.entityId) {
    return null
  }
  try {
    return admin.getEntity(props.fieldContext.entityKey, props.fieldContext.entityId)
  } catch {
    return null
  }
})

const fetchedMetadata = useEntityMetadata(
  props.fieldContext.entityKey,
  entityForMetadata
)

const renderAs = computed(() => {
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

