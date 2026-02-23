<!--
  LEARNING: Shared Entity Form Content Component
  WHY: Provides consistent form field rendering for EntityCard
  PATTERN: Uses unified layout-based rendering (inline/stacked/regular) for ALL entity types
  NOTE: Row 1 (name/active) rendered separately above this component
  NOTE: All other fields rendered using unified layout mechanism - no type-specific logic
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import DynamicForm from './DynamicForm.vue'
import FieldRenderer from './fields/FieldRenderer.vue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFormFields } from '@/composables/useFormFields'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import { getFieldKeys } from '@/utils/forms/getFieldKeys'
import type { FormContext } from 'vee-validate'

interface Props {
  entityKey: GlobalEntityKey
  entityId?: GlobalEntityId
  form: FormContext<Record<string, unknown>>
  /**
WHY: In dialogs, titleField should be rendered as a form field (moda...
   */
  modalMode?: boolean
  /**
   */
  renderLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modalMode: false,
  renderLayout: true
})

/**
 */
const dynamicFormRef = ref<InstanceType<typeof DynamicForm> | null>(null)
void dynamicFormRef.value // ref used by template

/**
 * WHY: Current entity ID for composable
WHY: Need stable reference for composable
 */
const currentEntityId = ref<GlobalEntityId>(props.entityId ?? toGlobalEntityId('new-' + String(Date.now())))

watch(() => props.entityId, (newId) => {
  if (newId) {
    currentEntityId.value = newId
  }
}, { immediate: true })

const adminConfig = useAdminConfig()

const adminComp = useAdmin()
const entity = computed(() => {
  if (!props.entityId) return null
  try {
    return adminComp.getEntity(props.entityKey, props.entityId) as GlobalEntity<typeof props.entityKey> | null
  } catch {
    return null
  }
})

const { fieldMetadata } = useEntityMetadata(props.entityKey, entity)

const fieldKeys = computed(() => {
  return getFieldKeys({
    entity: entity.value as Record<string, unknown> | null,
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
 * WHY: Use form fields composable for unified layout-based rendering
PATTERN: U...
 */
const formRefForComposable = computed<FormContext | undefined>(() => props.form)

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
  readyInlineFields,
  readyStackedFields,
  getFieldContext: getFormFieldContext
} = formFields

/**
 * PATTERN: Use formFields composable's getFieldContext for consistency
 */
const getFieldContextFromFormFields = (fieldKey: GlobalFieldKey<GlobalEntityKey>) => {
  return getFormFieldContext(fieldKey)
}

/**
 * PATTERN: Access field contexts from formFields composable
 */
const getNameFieldContext = () => {
  return getFieldContextFromFormFields('name')
}

const getActiveFieldContext = () => {
  return getFieldContextFromFormFields('active')
}


/**
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
    <div class="dynamic-form-fields-wrapper d-none">
      <DynamicForm
        ref="_dynamicFormRef"
        :entity-key="entityKey"
        :entity-id="entityId"
        :form="form"
        :modal-mode="modalMode"
      />
    </div>
    
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
