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
 * WHY: Replaces hardcoded fields with config-driven approach
     Ensures all f...
 */
import { computed, ref, watch } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import { VForm } from 'vuetify/components'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useFormFields } from '@/composables/useFormFields'
import { useFormElementPatching } from '@/composables/admin/useFormElementPatching'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { getFieldKeys } from '@/utils/forms/getFieldKeys'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'

import FieldRenderer from './fields/FieldRenderer.vue'

const autocompleteOff = AUTCOMPLETE_OFF

interface Props {
  entityKey: GlobalEntityKey
  entityId?: GlobalEntityId
  form: FormContext
  /**
   *      In card views, titleField is rendered in the card title, not as a form field
   */
  modalMode?: boolean
}

const props = defineProps<Props>()


const formRef = ref<InstanceType<typeof VForm> | null>(null)

/**
 * WHY: Admin config composable (initialized immediately for computed properties)
 */
const adminConfig = useAdminConfig()
const adminComp = useAdmin()

/**
 */
const formRefForComposable = computed<FormContext>(() => props.form)

/**
 * WHY: Current entity ID for composable
WHY: Need stable reference for composable
 */
const tempEntityId = ref<GlobalEntityId>(toGlobalEntityId('new-' + String(Date.now())))
const currentEntityId = ref<GlobalEntityId>(props.entityId || tempEntityId.value)

watch(() => props.entityId, (newId) => {
  if (newId) {
    currentEntityId.value = newId
  }
}, { immediate: true })

const entityForMetadata = computed(() => {
  if (!currentEntityId.value) return null
  try {
    return adminComp.getEntity(props.entityKey, currentEntityId.value) as GlobalEntity<typeof props.entityKey> | null
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

