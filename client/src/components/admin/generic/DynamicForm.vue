<!--
  LEARNING: DynamicForm Component - Generates form inputs from admin configs
  WHY: Consolidated component that replaces DynamicFormInputs and DynamicFormFields
  PATTERN: Iterates over formFieldConfig to render all inputs dynamically
  COMPARISON: React uses InputRenderer with config iteration. Vue uses same pattern.
-->
<template>
  <!-- LEARNING: Disable password manager autofill for admin configuration forms -->
  <!-- WHY: These are NOT password/login forms - they're admin config forms that password managers should ignore -->
  <VForm 
    ref="formRef" 
    class="dynamic-form"
    :autocomplete="autocompleteOff"
  >
    <!-- LEARNING: Unified layout-based rendering for ALL entity types -->
    <!-- WHY: Single rendering path for all entities using inline/stacked layout -->
    <!-- PATTERN: No entity-type-specific code paths - all entities use same layout mechanism -->
    
    <!-- Inline Fields Row -->
    <!-- LEARNING: Only render fields with ready contexts to avoid timing errors -->
    <!-- WHY: Contexts are created asynchronously, template may render before all are ready -->
    <!-- LEARNING: Use Vuetify responsive grid for inline fields -->
    <!-- WHY: Ensures fields stack properly on mobile and display inline on larger screens -->
    <!-- PATTERN: Use VRow/VCol with responsive breakpoints for mobile-first responsive design -->
    <VRow v-if="readyInlineFields && readyInlineFields.length > 0" class="mb-4">
      <VCol
        v-for="fieldKey in readyInlineFields"
        :key="String(fieldKey)"
        cols="12"
        :sm="readyInlineFields.length > 1 ? 6 : 12"
        :md="readyInlineFields.length > 2 ? 4 : readyInlineFields.length > 1 ? 6 : 12"
        :lg="readyInlineFields.length > 3 ? 3 : readyInlineFields.length > 2 ? 4 : readyInlineFields.length > 1 ? 6 : 12"
      >
        <InputRenderer
          :field-context="getFieldContext(fieldKey)!"
          :show-label="true"
        />
      </VCol>
    </VRow>
    
    <!-- Stacked Fields -->
    <!-- LEARNING: Only render fields with ready contexts to avoid timing errors -->
    <div v-for="fieldKey in (readyStackedFields || [])" :key="String(fieldKey)" class="mb-4">
      <InputRenderer
        :field-context="getFieldContext(fieldKey)!"
        :show-label="true"
      />
    </div>
    
  </VForm>
</template>

<script setup lang="ts">

/**
 * LEARNING: DynamicForm generates form fields dynamically from admin configs
 * 
 * WHY: Consolidated component that replaces DynamicFormInputs and DynamicFormFields
 *      Replaces hardcoded fields with config-driven approach
 *      Ensures all fields from FIELD_KEYS are included
 * 
 * PATTERN: 
 * 1. Get formFieldConfig for entity
 * 2. Get instanceConfig to determine field layout (inline, stacked, omitted)
 * 3. Filter out omitted fields
 * 4. Group fields by layout (inline, stacked, regular)
 * 5. Create FieldContext for each field
 * 6. Render InputRenderer for each field
 * 
 * COMPARISON: React uses similar pattern with GenericInstance component
 */

import { computed, ref, watch, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalEntityId } from '../../../types/entities'
import { useAdminConfig } from '../../../composables/useAdminConfig'
import { useFormFields } from '../../../composables/useFormFields'
import { useFormElementPatching } from '../../../composables/admin/useFormElementPatching'
import { useFieldVisibility } from '../../../composables/admin/useFieldVisibility'
import { AUTCOMPLETE_OFF } from '../../../utils/autocomplete'

import InputRenderer from './fields/InputRenderer.vue'

// Autocomplete value constant for template
const autocompleteOff = AUTCOMPLETE_OFF

interface Props {
  entityKey: GlobalEntityKey
  entityId?: GlobalEntityId
  form?: ReturnType<typeof useForm>
  /**
   * LEARNING: Modal mode flag - when true, includes titleField in visible fields
   * WHY: In modal dialogs, the name field should be editable even though it's the titleField
   *      In card views, titleField is rendered in the card title, not as a form field
   * PATTERN: Conditional field visibility based on context (modal vs card)
   */
  modalMode?: boolean
  /**
   * LEARNING: Additional omitted fields - fields to hide beyond instanceConfig.omitFields
   * WHY: Allows parent components to conditionally hide fields (e.g., name and partTypeRef for PartProfile in modal)
   * PATTERN: Array of field keys to exclude from rendering
   */
  additionalOmittedFields?: GlobalFieldKey<GlobalEntityKey>[]
}

const props = defineProps<Props>()


/**
 * WHY: Form element reference for patching form.elements
 * WHY: Need to access actual DOM form element to patch form.elements for browser extension compatibility
 * PATTERN: Template ref to access VForm's underlying form element
 */
const formRef = ref<InstanceType<typeof import('vuetify/components').VForm> | null>(null)

/**
 * WHY: Admin config composable (initialized immediately for computed properties)
 * WHY: Computed properties need access to adminConfig, so it must be initialized before they're created
 * PATTERN: Initialize immediately, not inside try-catch, so computed properties can access it
 */
const adminConfig = useAdminConfig()

/**
 * LEARNING: Vee-Validate form instance (declared outside try-catch for defineExpose)
 * WHY: Fields need form instance for validation
 * PATTERN: Use provided form or create new one, declare outside try-catch so defineExpose can access it
 *          Single form instance shared across all fields in this component
 *          Form instance is passed to each field context via useFieldContext options
 *          This ensures all fields belong to the same form for validation coordination
 */
const formInstance = props.form || useForm()

/**
 * LEARNING: Current entity ID for composable
 * WHY: Need stable reference for composable
 * PATTERN: Ref that uses props.entityId if available, otherwise uses stable temp ID
 */
const tempEntityId = ref<GlobalEntityId>(('new-' + Date.now()) as GlobalEntityId)
const currentEntityId = ref<GlobalEntityId>(props.entityId || tempEntityId.value)

// Update entityId ref when props change
watch(() => props.entityId, (newId) => {
  if (newId) {
    currentEntityId.value = newId
  }
}, { immediate: true })

/**
 * LEARNING: Use field visibility composable for field filtering logic
 * WHY: Moves field visibility logic out of component into reusable composable
 * PATTERN: Composable handles allFieldKeys, omittedFields, titleField, visibleFields, and field configs
 */
const fieldVisibilityComposable = useFieldVisibility({
  entityKey: props.entityKey,
  entityId: computed(() => currentEntityId.value),
  modalMode: props.modalMode || false,
  additionalOmittedFields: props.additionalOmittedFields || []
})
const {
  visibleFields,
  inlineFieldsConfig,
  stackedFieldsConfig,
  omittedFields
} = fieldVisibilityComposable

/**
 * LEARNING: Use form fields composable for all field management logic
 * WHY: Moves all field categorization, context management, and layout logic to composable
 * PATTERN: Call composable with required parameters, use returned computed properties and methods
 */
const formRefForComposable = ref<FormContext | undefined>(formInstance as unknown as FormContext | undefined) as Ref<FormContext | undefined>

const formFields = useFormFields({
  entityKey: props.entityKey,
  entityId: currentEntityId,
  form: formRefForComposable,
  visibleFields,
  inlineFieldsConfig,
  stackedFieldsConfig,
  omitFieldsConfig: omittedFields,
  adminConfig
})

// Destructure composable return values for use in template
const {
  getFieldContext,
  readyInlineFields,
  readyStackedFields
} = formFields

/**
 * LEARNING: Use form element patching composable
 * WHY: Extracts DOM patching logic from component to composable
 * PATTERN: Composable handles form element patching and MutationObserver setup
 */
const { tryPatchFormImmediately } = useFormElementPatching({
  formRef,
  formSelector: '.dynamic-form',
  useMutationObserver: true
})

// LEARNING: Try to patch immediately (synchronously) before any events can fire
// WHY: Browser extension might access form.elements before async operations run
// PATTERN: Call immediately during component setup
tryPatchFormImmediately()

// LEARNING: Removed empty config watch - computed properties handle reactivity automatically
// WHY: visibleFields is already a computed property that depends on configs
// PATTERN: Trust Vue's reactivity system - no manual watch needed

/**
 * LEARNING: Expose form instance and form inputs to parent
 * WHY: Parent needs form to get values for save operation
 *      Parent also needs form inputs to render them separately (EntityCard)
 * PATTERN: defineExpose must be at top level of script setup, not inside try-catch
 */
defineExpose({
  form: formInstance,
  getFieldContext: formFields.getFieldContext
})
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}
</style>

