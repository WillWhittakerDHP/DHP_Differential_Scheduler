/**
 * WHY: Business Rule Form composable
WHY: Extracts form state, rule-type config...
 */
import { ref, computed, watch, type Ref } from 'vue'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/composables/admin/useBusinessRules'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/types/entities'
import { RULE_CONDITION_VALUES, RULE_TYPE_OPTIONS, RULE_TYPE_VALUES } from '@/constants/businessRulesConstants.js'

export function useBusinessRuleForm(selectedBlockId: Ref<GlobalEntityId | null>) {
  const showRuleDialog = ref(false)
  const editingRule: Ref<BusinessRule | null> = ref(null)

  const formData: Ref<BusinessRuleFormData> = ref({
    blockInstanceId: toGlobalEntityId(''),
    ruleType: RULE_TYPE_VALUES.REQUIRED_FIELDS,
    ruleConfig: { fields: [] },
    validationMessageAnnotationId: null,
    active: true,
  })

  const requiredFieldsArray = computed({
    get: (): string => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        const config = formData.value.ruleConfig as { fields: string[]; condition?: string }
        return config.fields?.join(', ') ?? ''
      }
      return ''
    },
    set: (value: string) => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        formData.value.ruleConfig = {
          fields: value.split(',').map((f) => f.trim()).filter((f) => f.length > 0),
          condition: (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition,
        }
      }
    },
  })

  const requiredFieldsCondition = computed({
    get: (): string => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        return (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition ?? ''
      }
      return ''
    },
    set: (value: string) => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRED_FIELDS) {
        formData.value.ruleConfig = {
          ...(formData.value.ruleConfig as { fields: string[]; condition?: string }),
          condition: value || undefined,
        }
      }
    },
  })

  const requiresAgent = computed({
    get: (): boolean => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRES_AGENT) {
        return (formData.value.ruleConfig as { requiresAgent: boolean }).requiresAgent ?? false
      }
      return false
    },
    set: (value: boolean) => {
      if (formData.value.ruleType === RULE_TYPE_VALUES.REQUIRES_AGENT) {
        formData.value.ruleConfig = { requiresAgent: value }
      }
    },
  })

  watch(
    () => formData.value.ruleType,
    (newType) => {
      switch (newType) {
        case RULE_TYPE_VALUES.REQUIRED_FIELDS:
          formData.value.ruleConfig = { fields: [] }
          break
        case RULE_TYPE_VALUES.REQUIRES_AGENT:
          formData.value.ruleConfig = { requiresAgent: false }
          break
        case RULE_TYPE_VALUES.CONDITIONAL_VALIDATION:
          formData.value.ruleConfig = { field: '', dependsOn: '', condition: RULE_CONDITION_VALUES.EQUALS, value: '' }
          break
        case RULE_TYPE_VALUES.VALIDATION_MESSAGE:
          formData.value.ruleConfig = { field: '', messageType: 'required' }
          break
      }
    }
  )

  const openCreateDialog = (): void => {
    editingRule.value = null
    formData.value = {
      blockInstanceId: selectedBlockId.value ?? toGlobalEntityId(''),
      ruleType: RULE_TYPE_VALUES.REQUIRED_FIELDS,
      ruleConfig: { fields: [] },
      validationMessageAnnotationId: null,
      active: true,
    }
    showRuleDialog.value = true
  }

  const openEditDialog = (rule: BusinessRule): void => {
    editingRule.value = rule
    formData.value = {
      blockInstanceId: rule.blockInstanceId,
      ruleType: rule.ruleType,
      ruleConfig: rule.ruleConfig,
      validationMessageAnnotationId: rule.validationMessageAnnotationId,
      active: rule.active,
    }
    showRuleDialog.value = true
  }

  const closeDialog = (): void => {
    showRuleDialog.value = false
    editingRule.value = null
    formData.value = {
      blockInstanceId: selectedBlockId.value ?? toGlobalEntityId(''),
      ruleType: RULE_TYPE_VALUES.REQUIRED_FIELDS,
      ruleConfig: { fields: [] },
      validationMessageAnnotationId: null,
      active: true,
    }
  }

  const formatRuleType = (ruleType: RuleType): string => {
    return RULE_TYPE_OPTIONS.find((o) => o.value === ruleType)?.title ?? ruleType
  }

  const formatRuleConfig = (rule: BusinessRule): string => {
    switch (rule.ruleType) {
      case RULE_TYPE_VALUES.REQUIRED_FIELDS: {
        const reqFields = rule.ruleConfig as { fields: string[]; condition?: string }
        return `Fields: ${reqFields.fields.join(', ')}${reqFields.condition ? ` (Condition: ${reqFields.condition})` : ''}`
      }
      case RULE_TYPE_VALUES.REQUIRES_AGENT: {
        const reqAgent = rule.ruleConfig as { requiresAgent: boolean }
        return `Requires Agent: ${reqAgent.requiresAgent ? 'Yes' : 'No'}`
      }
      case RULE_TYPE_VALUES.CONDITIONAL_VALIDATION: {
        const condVal = rule.ruleConfig as { field: string; dependsOn: string; condition: string; value: unknown }
        return `${condVal.field} ${condVal.condition} ${condVal.value} (depends on ${condVal.dependsOn})`
      }
      case RULE_TYPE_VALUES.VALIDATION_MESSAGE: {
        const valMsg = rule.ruleConfig as { field: string; messageType: string }
        return `Field: ${valMsg.field}, Type: ${valMsg.messageType}`
      }
      default:
        return JSON.stringify(rule.ruleConfig)
    }
  }

  return {
    formData,
    editingRule,
    showRuleDialog,
    ruleTypeOptions: RULE_TYPE_OPTIONS,
    requiredFieldsArray,
    requiredFieldsCondition,
    requiresAgent,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    formatRuleType,
    formatRuleConfig,
  }
}
