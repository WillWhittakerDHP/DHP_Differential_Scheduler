<!--
  LEARNING: Shared Entity Form Content Component
  WHY: Provides consistent form field rendering for EntityCard
  PATTERN: Uses unified layout-based rendering (inline/stacked/regular) for ALL entity types
  NOTE: Row 1 (name/active) rendered separately above this component
  NOTE: All other fields rendered using unified layout mechanism - no type-specific logic
-->
<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import DynamicForm from './DynamicForm.vue'
import FieldRenderer from './fields/FieldRenderer.vue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFormFields } from '@/composables/formFields/useFormFields'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/useAdmin'
import { getFieldKeys } from '@/utils/forms/getFieldKeys'
import type { FormContext } from 'vee-validate'

interface Props {
  entityKey: GlobalEntityKey
  entityId?: GlobalEntityId
  form: FormContext<Record<string, unknown>>
  /**
   * LEARNING: Modal mode flag
   * WHY: In dialogs, titleField should be rendered as a form field (modalMode=true)
   *      In cards, titleField is rendered in card title, not as form field (modalMode=false or undefined)
   * PATTERN: Based on EntityCard pattern - cards don't pass modalMode, dialogs pass modalMode=true
   */
  modalMode?: boolean
  /**
   * LEARNING: Toggle rendering vs context-only
   * WHY: EntityCard uses contexts but renders its own layout
   * PATTERN: Keep rendering defaulted to true for backward compatibility
   */
  renderLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modalMode: false,
  renderLayout: true
})

/**
 * LEARNING: Reference to DynamicForm component
 * WHY: Need to access field contexts and expose methods for parent components
 * PATTERN: Template ref to access child component methods
 */
const dynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null)

/**
 * LEARNING: Current entity ID for composable
 * WHY: Need stable reference for composable
 * PATTERN: Ref that uses props.entityId if available, otherwise uses stable temp ID
 */
const currentEntityId = ref<GlobalEntityId>(props.entityId || ('new-' + Date.now()) as GlobalEntityId)

// Watch for entityId changes
watch(() => props.entityId, (newId) => {
  if (newId) {
    currentEntityId.value = newId
  }
}, { immediate: true })

const adminConfig = useAdminConfig()

// LEARNING: Get metadata directly - no intermediate composable
// WHY: Metadata is the single source of truth, extract keys directly
const adminComp = useAdmin()
const entity = computed(() => {
  if (!props.entityId) return null
  try {
    return adminComp.getEntity(props.entityKey, props.entityId) as import('@/types/entities').GlobalEntity<typeof props.entityKey> | null
  } catch {
    return null
  }
})

const { fieldMetadata } = useEntityMetadata(props.entityKey, entity)

// LEARNING: Get field keys immediately from entity object, merge with metadata when available
// WHY: Field keys are static properties of the entity - they don't change, so get them immediately
//      Metadata tells us HOW to render fields, but field keys come from the entity itself
// PATTERN: Extract keys from entity immediately, use metadata for rendering config (not for key discovery)
// LEARNING: Use shared utility to eliminate duplication
// WHY: Same logic exists in DynamicForm - extract to shared utility
// PATTERN: Use getFieldKeys utility function
const fieldKeys = computed(() => {
  return getFieldKeys({
    entity: entity.value as Record<string, unknown> | null,
    fieldMetadata: fieldMetadata.value,
    entityKey: props.entityKey
  })
})

// LEARNING: Get layout config from instanceConfig (temporary until metadata provides layout)
const instanceConfig = computed(() => adminConfig.getInstanceConfig(props.entityKey).value || {})
const inlineFieldsConfig = computed(() => {
  const config = instanceConfig.value as { inlineFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  return (config?.inlineFields || []) as GlobalFieldKey<GlobalEntityKey>[]
})
const stackedFieldsConfig = computed(() => {
  const config = instanceConfig.value as { stackedFields?: GlobalFieldKey<GlobalEntityKey>[] } | undefined
  return (config?.stackedFields || []) as GlobalFieldKey<GlobalEntityKey>[]
})

/**
 * LEARNING: Use form fields composable for unified layout-based rendering
 * WHY: Provides readyInlineFields, readyStackedFields for ALL entity types
 * PATTERN: Use same composable for all entities - no special cases
 */
const formRefForComposable = ref<FormContext | undefined>(props.form as unknown as FormContext | undefined) as Ref<FormContext | undefined>

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

// LEARNING: Extract unified layout fields from composable
// WHY: Use same layout mechanism for ALL entity types
// PATTERN: readyInlineFields, readyStackedFields work for all entities
const {
  readyInlineFields,
  readyStackedFields,
  getFieldContext: getFormFieldContext
} = formFields

/**
 * LEARNING: Helper function to get field context
 * WHY: Need to render fields using FieldRenderer
 * PATTERN: Use formFields composable's getFieldContext for consistency
 */
const getFieldContextFromFormFields = (fieldKey: GlobalFieldKey<GlobalEntityKey>) => {
  return getFormFieldContext(fieldKey)
}

/**
 * LEARNING: Helper functions for name and active field contexts
 * WHY: Used to render name and active inline at top (rendered separately above this component)
 * PATTERN: Access field contexts from formFields composable
 */
const getNameFieldContext = () => {
  return getFieldContextFromFormFields('name')
}

const getActiveFieldContext = () => {
  return getFieldContextFromFormFields('active')
}


/**
 * LEARNING: Expose methods and properties for parent components
 * WHY: EntityCard needs access to field contexts
 * PATTERN: Expose getFieldContext and name/active helpers
 */
defineExpose({
  readyInlineFields,
  readyStackedFields,
  getFieldContext: getFieldContextFromFormFields,
  getNameFieldContext,
  getActiveFieldContext
})
</script>

<template>
  <!--
    LEARNING: EntityFormContent renders fields using unified layout-based mechanism
    WHY: Single rendering path for ALL entity types using inline/stacked layout
    PATTERN: Use readyInlineFields, readyStackedFields for all entities
    NOTE: Row 1 (name/active) is rendered separately above this component
    NOTE: DynamicForm creates contexts for all fields, but we render fields manually
  -->
  <div class="entity-form-content-wrapper">
    <!--
      LEARNING: DynamicForm component creates field contexts
      WHY: Field contexts must be created before we can render fields
      PATTERN: Render DynamicForm but hide it visually - we render fields manually
      NOTE: We don't exclude name/active from DynamicForm so contexts are created
            DynamicForm is hidden, so its rendered fields aren't visible
            We render fields manually using unified layout below
    -->
    <div class="dynamic-form-fields-wrapper" style="display: none;">
      <DynamicForm
        ref="dynamicFormRef"
        :entity-key="entityKey"
        :entity-id="entityId"
        :form="form"
        :modal-mode="modalMode"
      />
    </div>
    
    <!-- LEARNING: Unified Layout-Based Field Rendering for ALL Entity Types -->
    <!-- WHY: Single rendering path for all entities using inline/stacked layout -->
    <!-- PATTERN: No entity-type-specific code paths - all entities use same layout mechanism -->
    
    <!-- LEARNING: Inline Fields Row -->
    <!-- WHY: Fields configured as inlineFields appear in a horizontal row -->
    <!-- PATTERN: Use VRow/VCol with responsive breakpoints for mobile-first responsive design -->
    <template v-if="renderLayout">
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
            :field-context="getFieldContextFromFormFields(fieldKey)!"
            :show-label="true"
          />
        </VCol>
      </VRow>

      <!-- LEARNING: Stacked Fields -->
      <!-- WHY: Fields configured as stackedFields appear vertically stacked -->
      <!-- PATTERN: Each field in its own div with spacing -->
      <div v-for="fieldKey in (readyStackedFields || [])" :key="String(fieldKey)" class="mb-4">
        <FieldRenderer
          :field-context="getFieldContextFromFormFields(fieldKey)!"
          :show-label="true"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.entity-form-content-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
