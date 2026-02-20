<!--
  LEARNING: Business Rules Tab Component
  WHY: Allows admin to configure validation rules per block instance (services, dwelling adjustments)
  PATTERN: Composes useBusinessRules, useBusinessRuleForm, RuleFormDialog, RulesList; constants for copy.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBusinessRules, type BusinessRule } from '@/composables/admin/useBusinessRules'
import { useBusinessRuleForm } from '@/composables/admin/useBusinessRuleForm'
import { useGlobal } from '@/composables/useGlobal'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'
import RulesList from './RulesList.vue'
import RuleFormDialog from './RuleFormDialog.vue'

const {
  rules,
  loading,
  saving,
  error,
  success,
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleActive,
} = useBusinessRules()

const { getGlobalEntities } = useGlobal()

const selectedBlockId = ref<GlobalEntityId | null>(null)

const {
  formData,
  editingRule,
  showRuleDialog,
  ruleTypeOptions,
  requiredFieldsArray,
  requiredFieldsCondition,
  requiresAgent,
  openCreateDialog,
  openEditDialog,
  closeDialog,
  formatRuleType,
  formatRuleConfig,
} = useBusinessRuleForm(selectedBlockId)

const availableBlockInstances = computed(() => {
  const blockInstances = getGlobalEntities('blockInstance')
  return blockInstances.map((bi) => ({
    id: bi.id,
    title: bi.name ?? `Block ${bi.id}`,
    value: bi.id,
  }))
})

const availableValidationMessages = computed(() => {
  const annotationInstances = getGlobalEntities('annotationInstance')
  return annotationInstances.map((ai) => ({
    id: ai.id,
    title: ai.name ?? `Annotation ${ai.id}`,
    value: ai.id,
  }))
})

watch(
  selectedBlockId,
  async (newBlockId) => {
    if (newBlockId) {
      await fetchRules({ blockInstanceId: newBlockId })
    } else {
      rules.value = []
    }
  },
  { immediate: true }
)

const filteredRules = computed(() => {
  if (!selectedBlockId.value) return []
  return rules.value.filter((rule) => rule.blockInstanceId === selectedBlockId.value)
})

const saveRule = async (): Promise<void> => {
  if (editingRule.value) {
    const result = await updateRule(editingRule.value.id, formData.value)
    if (result) closeDialog()
  } else {
    const result = await createRule(formData.value)
    if (result) closeDialog()
  }
}

const handleDeleteRule = async (rule: BusinessRule): Promise<void> => {
  const title = ruleTypeOptions.find((o) => o.value === rule.ruleType)?.title
  if (confirm(`Delete business rule for ${title ?? rule.ruleType}?`)) {
    await deleteRule(rule.id)
  }
}

const handleToggleActive = (rule: BusinessRule): void => {
  toggleRuleActive(rule.id, !rule.active)
}

const selectedBlockTitle = computed(() =>
  availableBlockInstances.value.find((b) => b.value === selectedBlockId.value)?.title
)

function setRequiredFieldsArray(v: string): void {
  requiredFieldsArray.value = v
}
function setRequiredFieldsCondition(v: string): void {
  requiredFieldsCondition.value = v
}
function setRequiresAgent(v: boolean): void {
  requiresAgent.value = v
}
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
        <div class="text-h6 mb-3">{{ BUSINESS_RULES_UI.TITLE }}</div>
        <div class="text-body-2 mb-4 text-medium-emphasis">
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
          <div class="text-subtitle-1">
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
          <div class="text-h6 mb-2">{{ BUSINESS_RULES_UI.NO_RULES_TITLE }}</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            {{ BUSINESS_RULES_UI.NO_RULES_MESSAGE }}
          </div>
          <VBtn color="primary" @click="openCreateDialog">
            {{ BUSINESS_RULES_UI.ADD_FIRST_RULE }}
          </VBtn>
        </VCard>
      </div>

      <VCard v-else class="pa-8 text-center">
        <div class="text-h6 mb-2">{{ BUSINESS_RULES_UI.SELECT_BLOCK_TITLE }}</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ BUSINESS_RULES_UI.SELECT_BLOCK_MESSAGE }}
        </div>
      </VCard>
    </div>

    <RuleFormDialog
      v-model="showRuleDialog"
      v-model:form-data="formData"
      :editing-rule="editingRule"
      :rule-type-options="ruleTypeOptions"
      :available-block-instances="availableBlockInstances"
      :available-validation-messages="availableValidationMessages"
      :required-fields-array="requiredFieldsArray"
      :required-fields-condition="requiredFieldsCondition"
      :requires-agent="requiresAgent"
      :saving="saving"
      @update:required-fields-array="setRequiredFieldsArray"
      @update:required-fields-condition="setRequiredFieldsCondition"
      @update:requires-agent="setRequiresAgent"
      @save="saveRule"
      @close="closeDialog"
    />
  </div>
</template>

<style scoped>
.business-rules-tab {
  padding: 1rem;
}
</style>
