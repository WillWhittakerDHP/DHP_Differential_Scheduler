<!--
  Add/Edit business rule dialog; presentational. Consumes rule form context via provide/inject.
  WHY: Extracted from BusinessRulesTab for file-cohesion (plan Phase 2); props/emits replaced with inject (allowlist repair).
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import type { BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'
import { ruleFormDialogContextKey } from '@/composables/admin/injectionKeys'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'

const injected = inject(ruleFormDialogContextKey)
if (!injected) {
  throw new Error('RuleFormDialog must be used within a provider that supplies ruleFormDialogContextKey')
}
const ctx = injected as NonNullable<typeof injected>

const showRuleDialog = computed({
  get: () => ctx.showRuleDialog.value,
  set: (value: boolean) => { ctx.showRuleDialog.value = value },
})
const formDataUnwrapped = computed(() => ctx.formData.value)
const requiredFieldsArray = computed(() => ctx.requiredFieldsArray.value)
const requiredFieldsCondition = computed(() => ctx.requiredFieldsCondition.value)
const requiresAgent = computed(() => ctx.requiresAgent.value)
const availableValidationMessages = computed(() => ctx.availableValidationMessages.value)
const saving = computed(() => ctx.saving.value)

function setShowDialog(value: boolean): void {
  ctx.showRuleDialog.value = value
}

function updateField<Field extends keyof BusinessRuleFormData>(
  field: Field,
  value: BusinessRuleFormData[Field]
): void {
  ctx.updateFormField(field, value)
}

const dialogTitle = computed(() =>
  ctx.editingRule.value ? BUSINESS_RULES_UI.DIALOG_EDIT_TITLE : BUSINESS_RULES_UI.DIALOG_ADD_TITLE
)
function handleValidationMessageUpdate(v: string | null): void {
  updateField('validationMessageAnnotationId', v as BusinessRuleFormData['validationMessageAnnotationId'])
}
</script>

<template>
  <VDialog
    :model-value="showRuleDialog"
    max-width="600"
    persistent
    @update:model-value="setShowDialog($event)"
  >
    <VCard>
      <VCardTitle>
        {{ dialogTitle }}
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="ctx.saveRule()">
          <VSelect
            :model-value="formDataUnwrapped.ruleType"
            :items="ctx.ruleTypeOptions"
            :label="BUSINESS_RULES_UI.RULE_TYPE_LABEL"
            required
            class="mb-4"
            @update:model-value="(v: string) => updateField('ruleType', v as RuleType)"
          />

          <div v-if="formDataUnwrapped.ruleType === 'required_fields'" class="mb-4">
            <VTextField
              :model-value="requiredFieldsArray"
              :label="BUSINESS_RULES_UI.REQUIRED_FIELDS_LABEL"
              :hint="BUSINESS_RULES_UI.REQUIRED_FIELDS_HINT"
              persistent-hint
              required
              class="mb-2"
              @update:model-value="(v: string) => ctx.setRequiredFieldsArray(v)"
            />
            <VTextField
              :model-value="requiredFieldsCondition"
              :label="BUSINESS_RULES_UI.CONDITION_LABEL"
              :hint="BUSINESS_RULES_UI.CONDITION_HINT"
              persistent-hint
              @update:model-value="(v: string) => ctx.setRequiredFieldsCondition(v)"
            />
          </div>

          <div v-if="formDataUnwrapped.ruleType === 'requires_agent'" class="mb-4">
            <VSwitch
              :model-value="requiresAgent"
              :label="BUSINESS_RULES_UI.REQUIRES_AGENT_LABEL"
              :hint="BUSINESS_RULES_UI.REQUIRES_AGENT_HINT"
              persistent-hint
              @update:model-value="(v: boolean | null) => ctx.setRequiresAgent(v ?? false)"
            />
          </div>

          <VAlert v-if="formDataUnwrapped.ruleType === 'conditional_validation'" type="info" variant="tonal" class="mb-4">
            {{ BUSINESS_RULES_UI.CONDITIONAL_VALIDATION_PLACEHOLDER }}
          </VAlert>

          <VAlert v-if="formDataUnwrapped.ruleType === 'validation_message'" type="info" variant="tonal" class="mb-4">
            {{ BUSINESS_RULES_UI.VALIDATION_MESSAGE_PLACEHOLDER }}
          </VAlert>

          <VSelect
            :model-value="formDataUnwrapped.validationMessageAnnotationId"
            :items="availableValidationMessages"
            :label="BUSINESS_RULES_UI.VALIDATION_MESSAGE_LABEL"
            :hint="BUSINESS_RULES_UI.VALIDATION_MESSAGE_HINT"
            persistent-hint
            clearable
            class="mb-4"
            @update:model-value="handleValidationMessageUpdate"
          />

          <VSwitch
            :model-value="formDataUnwrapped.active"
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
          :disabled="saving"
          @click="ctx.closeDialog()"
        >
          {{ BUSINESS_RULES_UI.CANCEL }}
        </VBtn>
        <VBtn
          color="primary"
          :loading="saving"
          :disabled="saving"
          @click="ctx.saveRule()"
        >
          {{ ctx.editingRule.value ? BUSINESS_RULES_UI.UPDATE : BUSINESS_RULES_UI.CREATE }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
