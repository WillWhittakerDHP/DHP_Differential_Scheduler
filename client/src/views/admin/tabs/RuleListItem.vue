<script setup lang="ts">
import { computed } from 'vue'
import type { BusinessRule, RuleType } from '@/types/admin/businessRules'
import { BUSINESS_RULES_UI } from '@/constants/businessRulesConstants.js'

const props = defineProps<{
  rule: BusinessRule
  formatRuleType: (ruleType: RuleType) => string
  formatRuleConfig: (rule: BusinessRule) => string
  validationMessageTitle: string
}>()

const emit = defineEmits<{
  edit: [rule: BusinessRule]
  delete: [rule: BusinessRule]
  toggleActive: [rule: BusinessRule]
}>()

const statusChipColor = computed(() => (props.rule.active ? 'success' : 'default'))
const statusChipText = computed(() => (props.rule.active ? BUSINESS_RULES_UI.STATUS_ACTIVE : BUSINESS_RULES_UI.STATUS_INACTIVE))
const visibilityIcon = computed(() => (props.rule.active ? 'mdi-eye-off' : 'mdi-eye'))
</script>

<template>
  <tr>
    <td>{{ formatRuleType(rule.ruleType) }}</td>
    <td>{{ formatRuleConfig(rule) }}</td>
    <td>
      <span v-if="rule.validationMessageAnnotationId">
        {{ validationMessageTitle }}
      </span>
      <span v-else class="text-medium-emphasis">{{ BUSINESS_RULES_UI.VALIDATION_NONE }}</span>
    </td>
    <td>
      <VChip
        :color="statusChipColor"
        size="small"
      >
        {{ statusChipText }}
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
          :icon="visibilityIcon"
          @click="emit('toggleActive', rule)"
        />
      </div>
    </td>
  </tr>
</template>
