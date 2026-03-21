<!--
  WHY: Consolidated component that replaces DynamicFormInputs and DynamicFormFields
  PATTERN: Iterates over formFieldConfig to render all inputs dynamically
  COMPARISON: React uses FieldRenderer with config iteration. Vue uses same pattern.
-->
<template>
  <!-- WHY: These are NOT password/login forms - they're admin config forms that password managers should ignore -->
  <VForm 
    ref="formRef" 
    class="dynamic-form"
        :autocomplete="autocompleteOff"
  >
    <VRow v-if="readyInlineFields && readyInlineFields.length > 0" class="mb-4">
      <VCol
        v-for="fieldKey in readyInlineFields"
        :key="String(fieldKey)"
        cols="12"
        :sm="readyInlineFields.length > 1 ? 6 : 12"
        :md="readyInlineFields.length > 2 ? 4 : readyInlineFields.length > 1 ? 6 : 12"
        :lg="inlineFieldLgCols"
      >
        <FieldRenderer
          :field-context="getFieldContext(fieldKey)!"
          :show-label="true"
        />
      </VCol>
    </VRow>
    
    <!-- Stacked Fields -->
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
 * WHY: Replaces hardcoded fields with config-driven approach
     Ensures all f...
 */
import { computed, ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { VForm } from 'vuetify/components'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useFormFields } from '@/composables/useFormFields'
import { useFormElementPatching } from '@/composables/admin/useFormElementPatching'
import { useEntityIdReset } from '@/composables/admin/useEntityIdReset'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFormFieldConfigs } from '@/composables/admin/useFormFieldConfigs'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { createLogger } from '@/utils/logger'

import FieldRenderer from './fields/FieldRenderer.vue'

const logger = createLogger('DynamicForm')

const autocompleteOff = AUTCOMPLETE_OFF

interface Props {
  entityKey: GlobalEntityKey
  entityId?: GlobalEntityId
  form: FormContext
  modalMode?: boolean
}

const props = defineProps<Props>()

const formRef = ref<InstanceType<typeof VForm> | null>(null)

/**
 * WHY: Admin config composable (initialized immediately for computed properties)
 */
const adminConfig = useAdminConfig()
const adminComp = useAdmin()

const formRefForComposable = computed<FormContext>(() => props.form)

/**
 * WHY: Current entity ID for composable
WHY: Need stable reference for composable
 */
const tempEntityId = ref<GlobalEntityId>(toGlobalEntityId('new-' + String(Date.now())))
const currentEntityId = ref<GlobalEntityId>(props.entityId || tempEntityId.value)
useEntityIdReset(() => props.entityId, currentEntityId)

const entityForMetadata = computed(() => {
  if (!currentEntityId.value) return null
  try {
    return adminComp.getEntity(props.entityKey, currentEntityId.value) as GlobalEntity<typeof props.entityKey> | null
  } catch (err) {
    logger.warn('getEntity failed for metadata', { entityKey: props.entityKey, entityId: currentEntityId.value, error: err })
    return null
  }
})

const { fieldMetadata } = useEntityMetadata(props.entityKey, entityForMetadata)

const {
  fieldKeys,
  instanceConfig: _instanceConfig,
  inlineFieldsConfig,
  stackedFieldsConfig,
} = useFormFieldConfigs(props.entityKey, entityForMetadata, fieldMetadata)

/**
 * WHY: Use form fields composable for all field management logic
WHY: Moves all...
 */
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

const inlineFieldLgCols = computed(() => {
  const len = readyInlineFields.value.length
  return len > 3 ? 3 : len > 2 ? 4 : len > 1 ? 6 : 12
})

/**
 * WHY: Use form element patching composable
WHY: Extracts DOM patching logic fr...
 */
const { tryPatchFormImmediately } = useFormElementPatching({
  formRef,
  formSelector: '.dynamic-form',
  useMutationObserver: true
})

tryPatchFormImmediately()

/**
 * WHY: Removed empty config watch - computed properties handle reactivity autom...
 * PATTERN: Trust Vue's reactivity system - no manual watch needed
 */
defineExpose({
  form: props.form,
  getFieldContext: formFields.getFieldContext
})
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}
</style>
