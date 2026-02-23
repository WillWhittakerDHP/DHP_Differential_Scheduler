<template>
  <div v-if="effectiveFieldContext">
    <component
      v-if="hasValidComponent"
      :is="componentToRender"
      :field-context="effectiveFieldContext"
      :show-label="componentsWithLabel.includes(fieldComponent.componentType.value.type) ? showLabel : undefined"
      :collection-type="fieldComponent.componentType.value.type === 'relationshipCollection' ? collectionType : undefined"
    />
    
    <!-- Unknown Input Type -->
    <div v-else class="input-error">
      <div class="font-weight-bold mb-2">
        Unknown input type for: {{ String(fieldKey) }} ({{ entityKey }})
      </div>
      <div v-if="fieldComponent.fieldMetadataEntry" class="mt-2 text-caption">
        Metadata found but invalid renderAs value. Check console for details.
      </div>
      <div v-else class="mt-2 text-caption">
        No metadata found for this field. Check /admin-input-metadata or /admin-relationship-metadata. See console for details.
      </div>
      <!-- LEARNING: Log error when error UI renders -->
      <!-- WHY: Ensures we log even if watchEffect doesn't catch it -->
      <!-- PATTERN: Use onMounted/onUpdated or computed to log when this div renders -->
    </div>
  </div>
  <VAlert
    v-else
    type="warning"
    variant="tonal"
    class="mb-4"
  >
    Missing field context. This field must be configured in
    <code>/admin-input-metadata</code> or <code>/admin-relationship-metadata</code> before rendering.
  </VAlert>
</template>

<script setup lang="ts">
/**
 * WHY: Component type is determined from fieldComponentDispatcher, parallel to ...
 */
import { computed, toRef, watch, type Component, type ComputedRef } from 'vue'
import PrimitiveInputs from './PrimitiveInputs.vue'
import SelectInputs from './SelectInputs.vue'
import RelationshipCollection from '../collections/RelationshipCollection.vue'
import IconInput from './IconInput.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import { useFieldValue } from '@/composables/useFieldValue'
import { useFieldComponent } from '@/composables/admin/useFieldComponent'
import { useFieldRendererComponent } from '@/composables/admin/useFieldRendererComponent'
import type { FieldComponent } from '@/utils/forms/fieldComponentDispatcher'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalEntity } from '@/types/entities'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { createLogger } from '@/utils/logger'

const logger = createLogger('FieldRenderer')

interface Props {
  fieldContext?: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
  /**
   */
  fieldMetadata?: Record<string, FieldMetadataEntry>
  /**
   * WHY: /**
LEARNING: Optional override for readOnly state
WHY: Allows parent co...
   */
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const fieldContext = toRef(props, 'fieldContext')

// WHY: Vue 3 best practice - use toRef for prop tracking to ensure reactivity
const readOnlyProp = toRef(props, 'readOnly')

const effectiveFieldContext = computed(() => {
  if (!fieldContext.value) {
    return undefined
  }
  
  // LEARNING: Read readOnly prop value to establish dependency tracking
  // WHY: Accessing readOnlyProp.value in computed ensures Vue tracks the dependency
  // PATTERN: Read prop value in computed to establish reactivity dependency
  const readOnlyValue = readOnlyProp.value
  
  if (readOnlyValue === undefined) {
    return fieldContext.value
  }
  
  // WHY: Vue tracks object references - creating new objects ensures reactivity
  // PATTERN: Create new displayConfig object with readOnly override, then new fieldContext object
  // FIX: Preserve Refs when spreading - don't unwrap value Ref
  const originalDisplayConfig = fieldContext.value.displayConfig
  const newDisplayConfig: typeof originalDisplayConfig = {
    ...originalDisplayConfig,
    readOnly: readOnlyValue
  }
  
  // PATTERN: Copy all properties - value Ref should be preserved by spread
  return {
    ...fieldContext.value,
    displayConfig: newDisplayConfig
  }
})

const fieldKey = computed(() => effectiveFieldContext.value?.fieldKey)
const entityKey = computed(() => effectiveFieldContext.value?.entityKey)

// LEARNING: Use unified field value composable
// PATTERN: Only call composables if fieldContext exists
if (fieldContext.value) {
  useFieldValue(fieldContext.value)
}

/**
 * WHY: Composables must be called at setup time, but fieldContext can be undefined
 * PATTERN: Guard composable call, use computed wrapper to handle effectiveFieldCont...
 */
let entityForMetadataLookup: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
if (fieldContext.value) {
  entityForMetadataLookup = useFieldContextMetadataEntity(fieldContext.value)
} else {
  // WHY: Ensures type consistency between fallback and actual composable return
  // PATTERN: Use same ComputedRef type as composable
  entityForMetadataLookup = computed(() => null) as ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}
// WHY: effectiveFieldContext can be undefined even when fieldContext exists (due to readOnly override)
const entityForMetadata = computed(() => {
  if (!effectiveFieldContext.value) {
    return null
  }
  return entityForMetadataLookup.value
})

// PATTERN: Let parent component (EntityCard) handle warnings - it has access to metadata loading state

const fieldMetadataRef = computed(() => {
  const raw = props.fieldMetadata
  return raw !== undefined && raw !== null ? raw : {}
})


const fieldComponent = useFieldComponent({
  entityKey,
  fieldKey,
  entity: entityForMetadata,
  fieldMetadata: fieldMetadataRef
})


const collectionType = computed(() => {
  const key = String(fieldKey.value)
  if (key.includes('annotation')) return 'annotations'
  if (key.includes('event')) return 'events'
  if (key.includes('part')) return 'parts'
  return 'parts' // default
})

const componentMap: Record<FieldComponent['type'], Component | null> = {
  icon: IconInput,
  primitive: PrimitiveInputs,
  relationshipCollection: RelationshipCollection,
  select: SelectInputs,
  unknown: null
}

const componentsWithLabel: Array<FieldComponent['type']> = ['icon', 'primitive', 'select']

// LEARNING: Use field renderer component composable
// PATTERN: Composable provides component to render and validation computed properties
const {
  componentToRender,
  hasValidComponent,
  shouldShowError
} = useFieldRendererComponent({
  componentType: fieldComponent.componentType,
  componentMap,
  hasFieldContext: computed(() => !!effectiveFieldContext.value)
})

watch(
  shouldShowError,
  (showError) => {
    if (!showError || !effectiveFieldContext.value) {
      return
    }
    
    const componentType = fieldComponent.componentType.value
    const componentMapEntry = componentMap[componentType?.type]
    const hasComponent = componentMapEntry !== null && componentMapEntry !== undefined
    const metadataEntry = fieldComponent.fieldMetadataEntry.value
    const reason = 'reason' in componentType ? componentType.reason : 'unknown'
    
    // PATTERN: Structured error logging with all relevant context
    logger.error('Unknown input type detected', {
      componentType: componentType.type,
      reason: reason,
      fullComponentType: componentType,
      fieldKey: fieldKey.value,
      entityKey: entityKey.value,
      entityId: fieldContext.value?.entityId,
      fieldMetadataEntry: metadataEntry,
      renderAs: metadataEntry?.renderAs,
      dataType: metadataEntry?.dataType,
      inputConfig: metadataEntry?.inputConfig,
      fieldContext: {
        entityKey: fieldContext.value?.entityKey,
        entityId: fieldContext.value?.entityId,
        fieldKey: fieldContext.value?.fieldKey
      },
      componentMapHasEntry: hasComponent,
      componentMapEntry,
      componentMapKeys: Object.keys(componentMap),
      suggestedFix: reason === 'notConfigured' 
        ? 'Add field metadata at /admin-input-metadata or /admin-relationship-metadata'
        : reason === 'invalidRenderAs'
        ? `Check renderAs value in metadata. Expected: text, number, statusButton, iconSelect, select, multiselect, reference. Found: ${metadataEntry?.renderAs !== undefined && metadataEntry?.renderAs !== null ? metadataEntry.renderAs : 'undefined'}`
        : 'Unknown error - check field metadata configuration'
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.input-error {
  padding: 8px;
  background-color: rgba(var(--v-theme-error), 0.08);
  border: 1px dashed rgba(var(--v-theme-error), 0.4);
  border-radius: 4px;
  font-size: 12px;
  color: rgb(var(--v-theme-error));
}
</style>
