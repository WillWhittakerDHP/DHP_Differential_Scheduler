<template>
  <div>
    <!-- Text Input -->
    <TextInput
      v-if="fieldType === 'text'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Number Input -->
    <NumberInput
      v-else-if="fieldType === 'number'"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Boolean Input -->
    <BooleanInput
      v-else-if="fieldType === 'boolean'"
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
      Unknown input type: {{ fieldType }}
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
import { useAdminConfig } from '../../../../composables/useAdminConfig'
import { PrimitiveModeEnum, PrimitiveTypeEnum } from '../../../../types/entity/formDataEnums'
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

// LEARNING: Use adminConfig to determine field type from primitiveInput config
// WHY: Field type should be determined from formFieldConfig.primitiveInput.primitiveMode
// PATTERN: Read config and map primitiveMode to fieldType
const adminConfig = useAdminConfig()

// LEARNING: Get form field config to determine primitive field type
// WHY: primitiveMode determines which input component to render
// PATTERN: Read config and map primitiveMode to fieldType
const fieldConfig = computed(() => {
  return adminConfig.getFormFieldConfig(
    props.fieldContext.entityKey,
    props.fieldContext.fieldKey
  ).value
})

// LEARNING: Map primitiveMode enum to fieldType using type-safe enum comparisons
// WHY: Use enum values directly instead of string comparisons for type safety
// PATTERN: Switch on enum values, eliminate redundant mappings
const fieldType = computed(() => {
  const config = fieldConfig.value
  const primitiveConfig = config?.primitiveInput
  
  if (!primitiveConfig) {
    // Fallback to displayConfig if no primitiveInput config
    return props.fieldContext.displayConfig.fieldType || 'text'
  }
  
  const primitiveMode = primitiveConfig.primitiveMode
  const primitiveType = primitiveConfig.primitiveType
  
  // Map PrimitiveModeEnum to fieldType using switch statement for exhaustiveness checking
  // LEARNING: Switch statements provide TypeScript exhaustiveness checking and clearer enum handling
  // WHY: Safer than if-else chains - TypeScript can warn if we miss an enum value
  // PATTERN: Switch on enum with fall-through for consolidated mappings
  switch (primitiveMode) {
    case PrimitiveModeEnum.Input:
      // Input mode: determine type from primitiveType enum
      if (primitiveType === PrimitiveTypeEnum.Date) {
        return 'date'
      } else if (primitiveType === PrimitiveTypeEnum.Number) {
        return 'number'
      } else {
        return 'text'
      }
    
    case PrimitiveModeEnum.Number:
      return 'number'
    
    case PrimitiveModeEnum.Checkbox:
    case PrimitiveModeEnum.Toggle:
      // LEARNING: Fall-through handles multiple enum values mapping to same result
      // WHY: Cleaner than multiple conditions in if-else
      return 'boolean'
    
    case PrimitiveModeEnum.TextArea:
    case PrimitiveModeEnum.MultilineText:
      // LEARNING: Both TextArea and MultilineText map to textarea component
      // WHY: Consolidate redundant mappings - both represent multi-line text input
      return 'textarea'
    
    case PrimitiveModeEnum.Hidden:
    case PrimitiveModeEnum.Select:
    case PrimitiveModeEnum.ModeToggle:
    case PrimitiveModeEnum.TextEditOnExpand:
      // These modes don't map to input components - fall back to default
      break
    
    default:
      // LEARNING: Default case ensures exhaustiveness - TypeScript will warn if we miss an enum value
      // WHY: Safer than if-else chains which don't provide exhaustiveness checking
      // Check if primitiveType alone indicates date (fallback)
      if (primitiveType === PrimitiveTypeEnum.Date) {
        return 'date'
      }
      return props.fieldContext.displayConfig.fieldType || 'text'
  }
  
  // Fallback for handled cases that don't return (e.g., Hidden)
  return props.fieldContext.displayConfig.fieldType || 'text'
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

