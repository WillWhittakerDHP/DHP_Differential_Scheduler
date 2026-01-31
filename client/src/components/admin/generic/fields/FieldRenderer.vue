<template>
  <div v-if="effectiveFieldContext">
    <!-- LEARNING: Use componentType directly with component map for cleaner template -->
    <!-- WHY: Single source of truth, easier to add new component types, more performant -->
    <!-- PATTERN: Dynamic component rendering based on componentType discriminated union -->
    <!-- LEARNING: Use computed to determine if component exists in map -->
    <!-- WHY: Ensures consistent logic between template and watch -->
    <!-- PATTERN: Use computed property for component map lookup -->
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
 * LEARNING: FieldRenderer determines which input component to render based on field component dispatcher
 * 
 * WHY: Different field types need different input components (primitive vs select)
 *      Component type is determined from fieldComponentDispatcher, parallel to fieldLocationDispatcher
 * 
 * PATTERN: Factory pattern - uses getFieldComponent() dispatcher to determine component type and renders appropriate input component
 * 
 * COMPARISON: Parallel to field location dispatcher pattern - getFieldLocation() determines WHERE,
 *             getFieldComponent() determines WHAT component to render
 */

import { computed, toRef, watch, type Component, type ComputedRef } from 'vue'
import PrimitiveInputs from './PrimitiveInputs.vue'
import SelectInputs from './SelectInputs.vue'
import PartsCollection from '../collections/PartsCollection.vue'
import RelationshipCollection from '../collections/RelationshipCollection.vue'
import IconInput from './IconInput.vue'
import AnnotationsField from './AnnotationsField.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useFieldComponent } from '../../../../composables/admin/useFieldComponent'
import { useFieldRendererComponent } from '../../../../composables/admin/useFieldRendererComponent'
import type { FieldComponent } from '../../../../utils/forms/fieldComponentDispatcher'
import type { FieldMetadataEntry } from '../../../../types/entityMetadata'
import type { GlobalEntity } from '../../../../types/entities'
import { useFieldContextMetadataEntity } from '../../../../composables/admin/useFieldContextMetadataEntity'

interface Props {
  fieldContext?: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
  /**
   * LEARNING: Optional pre-loaded field metadata
   * WHY: Avoids duplicate metadata loads when parent component already has metadata
   * PATTERN: Pass metadata from EntityCard to avoid re-loading in FieldRenderer
   */
  fieldMetadata?: Record<string, FieldMetadataEntry>
  /**
   * LEARNING: Optional override for readOnly state
   * WHY: Allows parent components to dynamically control read-only state (e.g., make name field readonly when card is collapsed)
   * PATTERN: Overrides fieldContext.displayConfig.readOnly when provided
   */
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

// LEARNING: Handle undefined fieldContext gracefully
// WHY: Field context might not be created yet when component renders (e.g., during watch updates)
// PATTERN: Template uses v-if="fieldContext" to handle undefined case
const fieldContext = toRef(props, 'fieldContext')

/**
 * LEARNING: Create modified field context with readOnly override
 * WHY: Allows parent components to dynamically control read-only state (e.g., make name field readonly when card is collapsed)
 * PATTERN: Use toRef to track readOnly prop reactively, create computed that properly tracks nested property changes
 * NOTE: Vue 3 best practice - ensure computed tracks all dependencies, including nested object properties
 */
// LEARNING: Use toRef to track readOnly prop reactively
// WHY: Vue 3 best practice - use toRef for prop tracking to ensure reactivity
// PATTERN: toRef creates reactive reference to prop
const readOnlyProp = toRef(props, 'readOnly')

const effectiveFieldContext = computed(() => {
  if (!fieldContext.value) {
    return undefined
  }
  
  // LEARNING: Read readOnly prop value to establish dependency tracking
  // WHY: Accessing readOnlyProp.value in computed ensures Vue tracks the dependency
  // PATTERN: Read prop value in computed to establish reactivity dependency
  const readOnlyValue = readOnlyProp.value
  
  // If readOnly prop is not provided, use original fieldContext
  if (readOnlyValue === undefined) {
    return fieldContext.value
  }
  
  // LEARNING: Create new object reference with new displayConfig to ensure Vue tracks the change
  // WHY: Vue tracks object references - creating new objects ensures reactivity
  // PATTERN: Create new displayConfig object with readOnly override, then new fieldContext object
  // NOTE: This ensures Vue detects the change in nested displayConfig.readOnly property
  // FIX: Preserve Refs when spreading - don't unwrap value Ref
  const originalDisplayConfig = fieldContext.value.displayConfig
  const newDisplayConfig: typeof originalDisplayConfig = {
    ...originalDisplayConfig,
    readOnly: readOnlyValue
  }
  
  // LEARNING: Preserve Refs when creating new fieldContext object
  // WHY: Spreading preserves object structure, but we need to ensure value Ref is preserved
  // PATTERN: Copy all properties - value Ref should be preserved by spread
  // NOTE: JavaScript spread doesn't unwrap Refs, so value should remain a Ref
  return {
    ...fieldContext.value,
    displayConfig: newDisplayConfig
    // NOTE: value Ref is preserved by spread - no need to explicitly set it
  }
})

const fieldKey = computed(() => effectiveFieldContext.value?.fieldKey)
const entityKey = computed(() => effectiveFieldContext.value?.entityKey)

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
// LEARNING: Guard against undefined fieldContext
// WHY: Field context might not be created yet when component renders
// PATTERN: Only call composables if fieldContext exists
// NOTE: Use original fieldContext for composables, not effectiveFieldContext (composables need the real context)
if (fieldContext.value) {
  useFieldValue(fieldContext.value)
}

/**
 * LEARNING: Use field component composable
 * WHY: Extracts component type determination logic from component to composable
 * PATTERN: Composable provides type checking computed properties via fieldComponentDispatcher
 * LEARNING: Use composable for entity lookup
 * WHY: Extracts entity lookup logic to reusable composable
 * PATTERN: Composable handles both temporary and existing entities
 */
// LEARNING: Call composable at setup time with fieldContext (guarded by conditional)
// WHY: Composables must be called at setup time, but fieldContext can be undefined
// PATTERN: Guard composable call, use computed wrapper to handle effectiveFieldContext changes
// NOTE: This pattern is necessary because fieldContext can be undefined, but composable requires non-null value
// FIX: Call composable unconditionally by providing a fallback - composable handles missing entityKey/entityId
let entityForMetadataLookup: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
if (fieldContext.value) {
  entityForMetadataLookup = useFieldContextMetadataEntity(fieldContext.value)
} else {
  // Fallback when fieldContext is undefined - return computed that always returns null
  // LEARNING: Match return type of useFieldContextMetadataEntity
  // WHY: Ensures type consistency between fallback and actual composable return
  // PATTERN: Use same ComputedRef type as composable
  entityForMetadataLookup = computed(() => null) as ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}
// LEARNING: Use computed to return null when effectiveFieldContext is undefined
// WHY: effectiveFieldContext can be undefined even when fieldContext exists (due to readOnly override)
// PATTERN: Computed wrapper that checks effectiveFieldContext
const entityForMetadata = computed(() => {
  if (!effectiveFieldContext.value) {
    return null
  }
  return entityForMetadataLookup.value
})

// LEARNING: Removed premature warning from FieldRenderer
// WHY: EntityCard already handles missing context warnings comprehensively with readiness gates
// PATTERN: Let parent component (EntityCard) handle warnings - it has access to metadata loading state
// NOTE: VAlert in template still shows when fieldContext is missing, but no console warning

// LEARNING: Pass metadata to useFieldComponent if available
// WHY: Avoids duplicate metadata loads when parent component already has metadata
// PATTERN: Use provided metadata, otherwise let useFieldComponent load it
const fieldMetadataRef = computed(() => props.fieldMetadata ?? {})

// LEARNING: Removed debug console.trace
// WHY: Field rendering is now working correctly with effect scopes and readiness gates
// PATTERN: Remove debug logs once issues are resolved

const fieldComponent = useFieldComponent({
  entityKey,
  fieldKey,
  entity: entityForMetadata,
  fieldMetadata: fieldMetadataRef
})


// LEARNING: Determine collectionType for RelationshipCollection based on fieldKey
// WHY: RelationshipCollection needs collectionType prop to customize behavior
// PATTERN: Infer collectionType from fieldKey or use default
const collectionType = computed(() => {
  const key = String(fieldKey.value)
  if (key.includes('annotation')) return 'annotations'
  if (key.includes('event')) return 'events'
  if (key.includes('part')) return 'parts'
  return 'parts' // default
})

// LEARNING: Component map for dynamic rendering based on componentType
// WHY: Single source of truth for component type → component mapping
// PATTERN: Map FieldComponent type to Vue component
// NOTE: Using Component type to allow all Vue component types
// NOTE: relationshipCollection type uses RelationshipCollection component
const componentMap: Record<FieldComponent['type'], Component | null> = {
  icon: IconInput,
  primitive: PrimitiveInputs,
  relationshipCollection: RelationshipCollection,
  annotations: AnnotationsField, // Uses RelationshipCollection internally
  select: SelectInputs,
  unknown: null
}

// LEARNING: Components that accept showLabel prop
// WHY: Not all components accept showLabel (RelationshipCollection, PartsCollection, AnnotationsField don't)
// PATTERN: Array of component types that accept the prop
const componentsWithLabel: Array<FieldComponent['type']> = ['icon', 'primitive', 'select']

// LEARNING: Use field renderer component composable
// WHY: Extracts component rendering logic from component to composable
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

// LEARNING: Error logging for unknown component types
// WHY: Comprehensive error logging helps diagnose failures with full context
// PATTERN: Watch computed property that tracks when error UI should show
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
    
    // LEARNING: Log comprehensive diagnostic information to console
    // WHY: Console logs provide full diagnostic data without cluttering UI
    // PATTERN: Structured error logging with all relevant context
    console.error('[FieldRenderer] Unknown input type detected', {
      location: 'FieldRenderer.vue',
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
        ? `Check renderAs value in metadata. Expected: text, number, statusButton, iconSelect, select, multiselect, reference. Found: ${metadataEntry?.renderAs || 'undefined'}`
        : 'Unknown error - check field metadata configuration'
    })
  },
  { immediate: true }
)
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
