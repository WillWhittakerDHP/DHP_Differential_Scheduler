<!--
  Add/Edit business rule dialog; presentational. Receives form state and options, emits save and close.
  WHY: Extracted from BusinessRulesTab for file-cohesion (plan Phase 2).
-->
<script setup lang="ts">
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/composables/admin/useBusinessRules'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'

const props = defineProps<{
  modelValue: boolean
  formData: BusinessRuleFormData
  editingRule: BusinessRule | null
  ruleTypeOptions: readonly { title: string; value: string; description: string }[]
  availableBlockInstances: { id: string; title: string; value: string }[]
  availableValidationMessages: { id: string; title: string; value: string }[]
  requiredFieldsArray: string
  requiredFieldsCondition: string
  requiresAgent: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:formData': [value: BusinessRuleFormData]
  'update:requiredFieldsArray': [value: string]
  'update:requiredFieldsCondition': [value: string]
  'update:requiresAgent': [value: boolean]
  save: []
  close: []
}>()

function updateField<Field extends keyof BusinessRuleFormData>(
  field: Field,
  value: BusinessRuleFormData[Field]
): void {
  emit('update:formData', { ...props.formData, [field]: value })
}
</script>

<template>
  <VDialog
    :model-value="props.modelValue"
    max-width="600"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>
        {{ props.editingRule ? BUSINESS_RULES_UI.DIALOG_EDIT_TITLE : BUSINESS_RULES_UI.DIALOG_ADD_TITLE }}
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="emit('save')">
          <VSelect
            :model-value="props.formData.ruleType"
            :items="props.ruleTypeOptions"
            :label="BUSINESS_RULES_UI.RULE_TYPE_LABEL"
            required
            class="mb-4"
            @update:model-value="(v: string) => updateField('ruleType', v as RuleType)"
          />

          <div v-if="props.formData.ruleType === 'required_fields'" class="mb-4">
            <VTextField
              :model-value="props.requiredFieldsArray"
              :label="BUSINESS_RULES_UI.REQUIRED_FIELDS_LABEL"
              :hint="BUSINESS_RULES_UI.REQUIRED_FIELDS_HINT"
              persistent-hint
              required
              class="mb-2"
              @update:model-value="(v: string) => emit('update:requiredFieldsArray', v)"
            />
            <VTextField
              :model-value="props.requiredFieldsCondition"
              :label="BUSINESS_RULES_UI.CONDITION_LABEL"
              :hint="BUSINESS_RULES_UI.CONDITION_HINT"
              persistent-hint
              @update:model-value="(v: string) => emit('update:requiredFieldsCondition', v)"
            />
          </div>

          <div v-if="props.formData.ruleType === 'requires_agent'" class="mb-4">
            <VSwitch
              :model-value="props.requiresAgent"
              :label="BUSINESS_RULES_UI.REQUIRES_AGENT_LABEL"
              :hint="BUSINESS_RULES_UI.REQUIRES_AGENT_HINT"
              persistent-hint
              @update:model-value="(v: boolean | null) => emit('update:requiresAgent', v ?? false)"
            />
          </div>

          <VAlert v-if="props.formData.ruleType === 'conditional_validation'" type="info" variant="tonal" class="mb-4">
            {{ BUSINESS_RULES_UI.CONDITIONAL_VALIDATION_PLACEHOLDER }}
          </VAlert>

          <VAlert v-if="props.formData.ruleType === 'validation_message'" type="info" variant="tonal" class="mb-4">
            {{ BUSINESS_RULES_UI.VALIDATION_MESSAGE_PLACEHOLDER }}
          </VAlert>

          <VSelect
            :model-value="props.formData.validationMessageAnnotationId"
            :items="props.availableValidationMessages"
            :label="BUSINESS_RULES_UI.VALIDATION_MESSAGE_LABEL"
            :hint="BUSINESS_RULES_UI.VALIDATION_MESSAGE_HINT"
            persistent-hint
            clearable
            class="mb-4"
            @update:model-value="(v: string | null) => updateField('validationMessageAnnotationId', v as BusinessRuleFormData['validationMessageAnnotationId'])"
          />

          <VSwitch
            :model-value="props.formData.active"
            :label="BUSINESS_RULES_UI.ACTIVE_LABEL"
            :hint="BUSINESS_RULES_UI.ACTIVE_HINT"
            persistent-hint
            @update:model-value="(v: boolean | null) => updateField('active', v ?? false)"
          />
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          :disabled="props.saving"
          @click="emit('close')"
        >
          {{ BUSINESS_RULES_UI.CANCEL }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="props.saving"
          :disabled="props.saving"
          @click="emit('save')"
        >
          {{ props.editingRule ? BUSINESS_RULES_UI.UPDATE : BUSINESS_RULES_UI.CREATE }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
