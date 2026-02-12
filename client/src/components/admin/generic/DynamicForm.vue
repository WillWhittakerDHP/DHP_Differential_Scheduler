<!--
  LEARNING: DynamicForm Component - Generates form inputs from admin configs
  WHY: Consolidated component that replaces DynamicFormInputs and DynamicFormFields
  PATTERN: Iterates over formFieldConfig to render all inputs dynamically
  COMPARISON: React uses FieldRenderer with config iteration. Vue uses same pattern.
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
        <FieldRenderer
          :field-context="getFieldContext(fieldKey)!"
          :show-label="true"
        />
      </VCol>
    </VRow>
    
    <!-- Stacked Fields -->
    <!-- LEARNING: Only render fields with ready contexts to avoid timing errors -->
    <div v-for="fieldKey in (readyStackedFields || [])" :key="String(fieldKey)" class="mb-4">
      <FieldRenderer
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
 * 6. Render FieldRenderer for each field
 * 
 * COMPARISON: React uses similar pattern with GenericInstance component
 */

import { computed, ref, watch, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalEntityId } from '../../../types/entities'
import { useAdminConfig } from '../../../composables/useAdminConfig'
import { useAdmin } from '@/composables/useAdmin'
import { useFormFields } from '../../../composables/useFormFields'
import { useFormElementPatching } from '../../../composables/admin/useFormElementPatching'
import { useEntityMetadata } from '../../../composables/admin/useEntityMetadata'
import { getFieldKeys } from '../../../utils/forms/getFieldKeys'
import { AUTCOMPLETE_OFF } from '../../../utils/autocomplete'

import FieldRenderer from './fields/FieldRenderer.vue'

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
}

const props = defineProps<Props>()


const formRef = ref<InstanceType<typeof import('vuetify/components').VForm> | null>(null)

/**
 * WHY: Admin config composable (initialized immediately for computed properties)
 * WHY: Computed properties need access to adminConfig, so it must be initialized before they're created
 * PATTERN: Initialize immediately, not inside try-catch, so computed properties can access it
 */
const adminConfig = useAdminConfig()
const adminComp = useAdmin()

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

watch(() => props.entityId, (newId) => {
  if (newId) {
    currentEntityId.value = newId
  }
}, { immediate: true })

const entityForMetadata = computed(() => {
  if (!currentEntityId.value) return null
  try {
    return adminComp.getEntity(props.entityKey, currentEntityId.value) as import('@/types/entities').GlobalEntity<typeof props.entityKey> | null
  } catch {
    return null
  }
})

const { fieldMetadata } = useEntityMetadata(props.entityKey, entityForMetadata)

const fieldKeys = computed(() => {
  return getFieldKeys({
    entity: entityForMetadata.value as Record<string, unknown> | null,
    fieldMetadata: fieldMetadata.value,
    entityKey: props.entityKey
  })
})

const instanceConfig = computed(() => {
  const v = adminConfig.getInstanceConfig(props.entityKey).value
  return v !== undefined && v !== null ? v : {}
})
const inlineFieldsConfig = computed(() => {
  const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  const raw = config?.inlineFields
  return (raw !== undefined && raw !== null ? raw : []) as GlobalFieldKey<GlobalEntityKey>[]
})
const stackedFieldsConfig = computed(() => {
  const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  const raw = config?.stackedFields
  return (raw !== undefined && raw !== null ? raw : []) as GlobalFieldKey<GlobalEntityKey>[]
})

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
  fieldKeys,
  fieldMetadata,
  inlineFieldsConfig,
  stackedFieldsConfig,
  adminConfig
})

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

tryPatchFormImmediately()

// LEARNING: Removed empty config watch - computed properties handle reactivity automatically
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

