<!--
  Presentational table of business rules; emits edit, delete, toggleActive.
  WHY: Extracted from BusinessRulesTab for file-cohesion (plan Phase 2).
-->
<script setup lang="ts">
import type { BusinessRule, RuleType } from '@/composables/admin/useBusinessRules'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'

defineProps<{
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
        <tr v-for="rule in filteredRules" :key="rule.id">
          <td>{{ formatRuleType(rule.ruleType) }}</td>
          <td>{{ formatRuleConfig(rule) }}</td>
          <td>
            <span v-if="rule.validationMessageAnnotationId">
              {{ availableValidationMessages.find(m => m.value === rule.validationMessageAnnotationId)?.title ?? BUSINESS_RULES_UI.VALIDATION_LINKED }}
            </span>
            <span v-else class="text-medium-emphasis">{{ BUSINESS_RULES_UI.VALIDATION_NONE }}</span>
          </td>
          <td>
            <VChip
              :color="rule.active ? 'success' : 'default'"
              size="small"
            >
              {{ rule.active ? BUSINESS_RULES_UI.STATUS_ACTIVE : BUSINESS_RULES_UI.STATUS_INACTIVE }}
            </VChip>
          </td>
          <td>
            <div class="d-flex gap-2">
              <VBtn
                size="small"
                variant="text"
                icon="mdi-pencil"
                @click="emit('edit', rule)"
              />
              <VBtn
                size="small"
                variant="text"
                icon="mdi-delete"
                color="error"
                @click="emit('delete', rule)"
              />
              <VBtn
                size="small"
                variant="text"
                :icon="rule.active ? 'mdi-eye-off' : 'mdi-eye'"
                @click="emit('toggleActive', rule)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>
