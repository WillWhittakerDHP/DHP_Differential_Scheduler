<!--
  Presentational table of business rules; emits edit, delete, toggleActive.
  WHY: Extracted from BusinessRulesTab for file-cohesion (plan Phase 2).
-->
<script setup lang="ts">
import type { BusinessRule, RuleType } from '@/types/admin/businessRules'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'
import RuleListItem from './RuleListItem.vue'

const props = defineProps<{
  filteredRules: BusinessRule[]
  ruleTypeOptions: readonly { title: string; value: string; description: string }[]
  formatRuleType: (ruleType: RuleType) => string
  formatRuleConfig: (rule: BusinessRule) => string
  availableValidationMessages: { id: string; title: string; value: string }[]
}>()

const emit = defineEmits<{
  edit: [rule: BusinessRule]
  delete: [rule: BusinessRule]
  toggleActive: [rule: BusinessRule]
}>()

function ruleValidationMessageTitle(rule: BusinessRule): string {
  return props.availableValidationMessages.find(m => m.value === rule.validationMessageAnnotationId)?.title ?? BUSINESS_RULES_UI.VALIDATION_LINKED
}
</script>

<template>
  <VCard v-if="filteredRules.length > 0" class="mb-4">
    <VTable>
      <thead>
        <tr>
          <th>{{ BUSINESS_RULES_UI.TABLE_RULE_TYPE }}</th>
          <th>{{ BUSINESS_RULES_UI.TABLE_CONFIGURATION }}</th>
          <th>{{ BUSINESS_RULES_UI.TABLE_VALIDATION_MESSAGE }}</th>
          <th>{{ BUSINESS_RULES_UI.TABLE_STATUS }}</th>
          <th>{{ BUSINESS_RULES_UI.TABLE_ACTIONS }}</th>
        </tr>
      </thead>
      <tbody>
        <RuleListItem
          v-for="rule in filteredRules"
          :key="rule.id"
          :rule="rule"
          :format-rule-type="formatRuleType"
          :format-rule-config="formatRuleConfig"
          :validation-message-title="ruleValidationMessageTitle(rule)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @toggle-active="emit('toggleActive', $event)"
        />
      </tbody>
    </VTable>
  </VCard>
</template>
