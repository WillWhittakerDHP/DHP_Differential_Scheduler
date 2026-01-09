<template>
  <div>
    <!-- Icon Input -->
    <IconInput
      v-if="isIcon"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Primitive Input -->
    <PrimitiveInputs
      v-else-if="isPrimitive"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Nested Collection Input -->
    <NestedCollectionField
      v-else-if="isNested"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Annotations Input (special case) -->
    <AnnotationsField
      v-else-if="isAnnotations"
      :field-context="fieldContext"
    />
    
    <!-- Select Input -->
    <SelectInputs
      v-else-if="isSelect"
      :field-context="fieldContext"
      :show-label="showLabel"
    />
    
    <!-- Unknown Input Type -->
    <div v-else class="input-error">
      Unknown input type for: {{ String(fieldKey) }} ({{ entityKey }})
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LEARNING: InputRenderer determines which input component to render based on adminConfig
 * 
 * WHY: Different field types need different input components (primitive vs select)
 *      Field type is determined from adminConfig.formFieldConfig, not props
 * 
 * PATTERN: Factory pattern - reads field config from adminConfig and renders appropriate input component
 * 
 * COMPARISON: React uses adminConfig.formFieldConfig to determine field type.
 *             Vue now uses same pattern via useAdminConfig composable.
 */

import { computed } from 'vue'
import PrimitiveInputs from './PrimitiveInputs.vue'
import SelectInputs from './SelectInputs.vue'
import NestedCollectionField from './NestedCollectionField.vue'
import IconInput from './IconInput.vue'
import AnnotationsField from './AnnotationsField.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useFieldTypeDetermination } from '../../../../composables/admin/useFieldTypeDetermination'
// Render logger disabled - too verbose
// import type { RenderLogger } from '../../../../utils/renderLogger'
// import { RENDER_LOGGER_KEY } from '../../../../utils/renderLoggerKeys'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props
const fieldKey = computed(() => fieldContext.fieldKey)
const entityKey = computed(() => fieldContext.entityKey)

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
useFieldValue(fieldContext)

/**
 * LEARNING: Use field type determination composable
 * WHY: Extracts type determination logic from component to composable
 * PATTERN: Composable provides type checking computed properties
 */
const {
  isIcon,
  isPrimitive,
  isNested,
  isAnnotations,
  isSelect
} = useFieldTypeDetermination({
  entityKey,
  fieldKey
})

// Render logger disabled - too verbose
// if (logger) {
//   watch([fieldConfig, isPrimitive, isSelect, fieldValue], ([config, isPrim, isSel, value]) => {
//     if (config) {
//       logger.logRender(`InputRenderer - Rendering ${String(fieldKey.value)}`, {...})
//     }
//   }, { immediate: true })
// }
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

