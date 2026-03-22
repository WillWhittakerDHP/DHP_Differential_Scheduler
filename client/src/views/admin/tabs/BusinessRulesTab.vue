<!--
  WHY: Allows admin to configure validation rules per block instance (services, dwelling adjustments)
  PATTERN: Thin component; all logic in useBusinessRulesTab; RuleFormDialog, RulesList for UI.
-->
<script setup lang="ts">
import { provide } from 'vue'
import { useBusinessRulesTab } from '@/composables/admin/useBusinessRulesTab'
import { ruleFormDialogContextKey } from '@/types/admin/adminInjectionKeys'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'
import type { BusinessRuleFormData } from '@/types/admin/businessRules'
import RulesList from './RulesList.vue'
import RuleFormDialog from './RuleFormDialog.vue'

const tab = useBusinessRulesTab()
const {
  rules,
  loading,
  saving,
  error,
  success,
  selectedBlockId,
  availableBlockInstances,
  availableValidationMessages,
  filteredRules,
  selectedBlockTitle,
} = tab.data
const {
  formData,
  editingRule,
  showRuleDialog,
  ruleTypeOptions,
  requiredFieldsArray,
  requiredFieldsCondition,
  requiresAgent,
} = tab.form
const {
  openCreateDialog,
  openEditDialog,
  closeDialog,
  formatRuleType,
  formatRuleConfig,
  saveRule,
  handleDeleteRule,
  handleToggleActive,
  setRequiredFieldsArray,
  setRequiredFieldsCondition,
  setRequiresAgent,
} = tab.actions

function updateFormField<F extends keyof BusinessRuleFormData>(
  field: F,
  value: BusinessRuleFormData[F]
): void {
  formData.value = { ...formData.value, [field]: value }
}

provide(ruleFormDialogContextKey, {
  showRuleDialog,
  formData,
  editingRule,
  ruleTypeOptions,
  availableBlockInstances,
  availableValidationMessages,
  requiredFieldsArray,
  requiredFieldsCondition,
  requiresAgent,
  saving,
  updateFormField,
  setRequiredFieldsArray,
  setRequiredFieldsCondition,
  setRequiresAgent,
  saveRule,
  closeDialog,
})
</script>

<template>
  <div class="business-rules-tab">
    <div v-if="loading && !rules.length" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">{{ BUSINESS_RULES_UI.LOADING_RULES }}</div>
    </div>

    <div v-else>
      <VAlert
        v-if="success"
        type="success"
        dismissible
        class="mb-4"
        @click:close="success = null"
      >
        {{ success }}
      </VAlert>

      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </VAlert>

      <div class="mb-6">
        <div class="text-headline-small mb-3">{{ BUSINESS_RULES_UI.TITLE }}</div>
        <div class="text-body-medium mb-4 text-medium-emphasis">
          {{ BUSINESS_RULES_UI.DESCRIPTION }}
        </div>

        <VSelect
          v-model="selectedBlockId"
          :items="availableBlockInstances"
          :label="BUSINESS_RULES_UI.SELECT_BLOCK_LABEL"
          :hint="BUSINESS_RULES_UI.SELECT_BLOCK_HINT"
          persistent-hint
          clearable
          class="mb-4"
        />
      </div>

      <div v-if="selectedBlockId">
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-body-large">
            Rules for {{ selectedBlockTitle }}
          </div>
          <VBtn
            color="primary"
            :disabled="!selectedBlockId"
            @click="openCreateDialog"
          >
            {{ BUSINESS_RULES_UI.ADD_RULE }}
          </VBtn>
        </div>

        <RulesList
          :filtered-rules="filteredRules"
          :rule-type-options="ruleTypeOptions"
          :format-rule-type="formatRuleType"
          :format-rule-config="formatRuleConfig"
          :available-validation-messages="availableValidationMessages"
          @edit="openEditDialog"
          @delete="handleDeleteRule"
          @toggle-active="handleToggleActive"
        />

        <VCard v-if="filteredRules.length === 0" class="pa-8 text-center">
          <div class="text-headline-small mb-2">{{ BUSINESS_RULES_UI.NO_RULES_TITLE }}</div>
          <div class="text-body-medium text-medium-emphasis mb-4">
            {{ BUSINESS_RULES_UI.NO_RULES_MESSAGE }}
          </div>
          <VBtn color="primary" @click="openCreateDialog">
            {{ BUSINESS_RULES_UI.ADD_FIRST_RULE }}
          </VBtn>
        </VCard>
      </div>

      <VCard v-else class="pa-8 text-center">
        <div class="text-headline-small mb-2">{{ BUSINESS_RULES_UI.SELECT_BLOCK_TITLE }}</div>
        <div class="text-body-medium text-medium-emphasis">
          {{ BUSINESS_RULES_UI.SELECT_BLOCK_MESSAGE }}
        </div>
      </VCard>
    </div>

    <RuleFormDialog />
  </div>
</template>

<style scoped>
.business-rules-tab {
  padding: 1rem;
}
</style>
