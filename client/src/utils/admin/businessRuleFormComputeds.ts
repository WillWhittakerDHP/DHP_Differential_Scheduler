/**
 * Form state, rule-type defaults, and display helpers for business rules admin UI.
 * WHY: Keeps useBusinessRuleForm within function-complexity limits.
 */

import { computed, type Ref, type WritableComputedRef } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { RuleConfig } from '@shared/types/businessRulesTypes'
import { RULE_CONDITION_VALUES, RULE_TYPE_OPTIONS, RULE_TYPE_VALUES } from '@/constants/businessRulesConstants.js'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'
import { toGlobalEntityId } from '@/utils/globalEntity'
import {
  requiredFieldsConfigFromCommaString,
  requiredFieldsConfigWithCondition,
  type RequiredFieldsRuleConfigShape,
} from '@/utils/admin/requiredFieldsRuleConfigHelpers'

const DEFAULT_RULE_CONFIG_BY_TYPE: Record<RuleType, RuleConfig> = {
  [RULE_TYPE_VALUES.REQUIRED_FIELDS]: { fields: [] },
  [RULE_TYPE_VALUES.REQUIRES_AGENT]: { requiresAgent: false },
  [RULE_TYPE_VALUES.CONDITIONAL_VALIDATION]: {
    field: '',
    dependsOn: '',
    condition: RULE_CONDITION_VALUES.EQUALS,
    value: '',
  },
  [RULE_TYPE_VALUES.VALIDATION_MESSAGE]: { field: '', messageType: 'required' },
}

export function createEmptyBusinessRuleFormData(blockInstanceId: GlobalEntityId): BusinessRuleFormData {
  return {
    blockInstanceId,
    ruleType: RULE_TYPE_VALUES.REQUIRED_FIELDS,
    ruleConfig: { fields: [] },
    validationMessageAnnotationId: null,
    active: true,
  }
}

export function businessRuleFormDataFromRule(rule: BusinessRule): BusinessRuleFormData {
  return {
    blockInstanceId: rule.blockInstanceId,
    ruleType: rule.ruleType,
    ruleConfig: rule.ruleConfig,
    validationMessageAnnotationId: rule.validationMessageAnnotationId,
    active: rule.active,
  }
}

export function defaultRuleConfigForRuleType(ruleType: RuleType): RuleConfig {
  return DEFAULT_RULE_CONFIG_BY_TYPE[ruleType]
}

export function formatBusinessRuleTypeLabel(ruleType: RuleType): string {
  return RULE_TYPE_OPTIONS.find((o) => o.value === ruleType)?.title ?? ruleType
}

function summaryRequiredFields(rule: BusinessRule): string {
  const reqFields = rule.ruleConfig as { fields: string[]; condition?: string }
  return `Fields: ${reqFields.fields.join(', ')}${reqFields.condition ? ` (Condition: ${reqFields.condition})` : ''}`
}

function summaryRequiresAgent(rule: BusinessRule): string {
  const reqAgent = rule.ruleConfig as { requiresAgent: boolean }
  return `Requires Agent: ${reqAgent.requiresAgent ? 'Yes' : 'No'}`
}

function summaryConditionalValidation(rule: BusinessRule): string {
  const condVal = rule.ruleConfig as { field: string; dependsOn: string; condition: string; value: unknown }
  return `${condVal.field} ${condVal.condition} ${condVal.value} (depends on ${condVal.dependsOn})`
}

function summaryValidationMessage(rule: BusinessRule): string {
  const valMsg = rule.ruleConfig as { field: string; messageType: string }
  return `Field: ${valMsg.field}, Type: ${valMsg.messageType}`
}

const CONFIG_SUMMARY_BY_RULE_TYPE: Record<RuleType, (rule: BusinessRule) => string> = {
  [RULE_TYPE_VALUES.REQUIRED_FIELDS]: summaryRequiredFields,
  [RULE_TYPE_VALUES.REQUIRES_AGENT]: summaryRequiresAgent,
  [RULE_TYPE_VALUES.CONDITIONAL_VALIDATION]: summaryConditionalValidation,
  [RULE_TYPE_VALUES.VALIDATION_MESSAGE]: summaryValidationMessage,
}

export function formatBusinessRuleConfigSummary(rule: BusinessRule): string {
  const formatter = CONFIG_SUMMARY_BY_RULE_TYPE[rule.ruleType]
  if (formatter) {
    return formatter(rule)
  }
  return JSON.stringify(rule.ruleConfig)
}

export function buildRequiredFieldsArrayWritable(
  formData: Ref<BusinessRuleFormData>
): WritableComputedRef<string> {
  return computed({
    get: (): string => {
      if (formData.value.ruleType !== RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        return ''
      }
      const config = formData.value.ruleConfig as RequiredFieldsRuleConfigShape
      return config.fields?.join(', ') ?? ''
    },
    set: (value: string) => {
      if (formData.value.ruleType !== RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        return
      }
      const prev = formData.value.ruleConfig as RequiredFieldsRuleConfigShape
      formData.value.ruleConfig = requiredFieldsConfigFromCommaString(prev, value)
    },
  })
}

export function buildRequiredFieldsConditionWritable(
  formData: Ref<BusinessRuleFormData>
): WritableComputedRef<string> {
  return computed({
    get: (): string => {
      if (formData.value.ruleType !== RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        return ''
      }
      return (formData.value.ruleConfig as RequiredFieldsRuleConfigShape).condition ?? ''
    },
    set: (value: string) => {
      if (formData.value.ruleType !== RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        return
      }
      const prev = formData.value.ruleConfig as RequiredFieldsRuleConfigShape
      formData.value.ruleConfig = requiredFieldsConfigWithCondition(prev, value)
    },
  })
}

export function buildRequiresAgentWritable(formData: Ref<BusinessRuleFormData>): WritableComputedRef<boolean> {
  return computed({
    get: (): boolean => {
      if (formData.value.ruleType !== RULE_TYPE_VALUES.REQUIRES_AGENT) {
        return false
      }
      return (formData.value.ruleConfig as { requiresAgent: boolean }).requiresAgent ?? false
    },
    set: (value: boolean) => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRES_AGENT) {
        formData.value.ruleConfig = { requiresAgent: value }
      }
    },
  })
}

export function emptyBlockIdPlaceholder(): GlobalEntityId {
  return toGlobalEntityId('')
}
