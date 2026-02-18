/**
 * Business Rule Form composable
 * WHY: Extracts form state, rule-type config computeds, and format helpers from BusinessRulesTab (complexity/file-cohesion).
 */

import { ref, computed, watch, type Ref } from 'vue'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/composables/admin/useBusinessRules'
import { toGlobalEntityId, type GlobalEntityId } from '@/types/entities'
import { RULE_TYPE_OPTIONS } from '@/constants/businessRulesConstants.js'

export function useBusinessRuleForm(selectedBlockId: Ref<GlobalEntityId | null>) {
  const showRuleDialog = ref(false)
  const editingRule: Ref<BusinessRule | null> = ref(null)

  const formData: Ref<BusinessRuleFormData> = ref({
    blockInstanceId: toGlobalEntityId(''),
    ruleType: 'required_fields',
    ruleConfig: { fields: [] },
    validationMessageAnnotationId: null,
    active: true,
  })

  const requiredFieldsArray = computed({
    get: (): string => {
      if (formData.value.ruleType === 'required_fields') {
        const config = formData.value.ruleConfig as { fields: string[]; condition?: string }
        return config.fields?.join(', ') ?? ''
      }
      return ''
    },
    set: (value: string) => {
      if (formData.value.ruleType === 'required_fields') {
        formData.value.ruleConfig = {
          fields: value.split(',').map((f) => f.trim()).filter((f) => f.length > 0),
          condition: (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition,
        }
      }
    },
  })

  const requiredFieldsCondition = computed({
    get: (): string => {
      if (formData.value.ruleType === 'required_fields') {
        return (formData.value.ruleConfig as { fields: string[]; condition?: string }).condition ?? ''
      }
      return ''
    },
    set: (value: string) => {
      if (formData.value.ruleType === 'required_fields') {
        formData.value.ruleConfig = {
          ...(formData.value.ruleConfig as { fields: string[]; condition?: string }),
          condition: value || undefined,
        }
      }
    },
  })

  const requiresAgent = computed({
    get: (): boolean => {
      if (formData.value.ruleType === 'requires_agent') {
        return (formData.value.ruleConfig as { requiresAgent: boolean }).requiresAgent ?? false
      }
      return false
    },
    set: (value: boolean) => {
      if (formData.value.ruleType === 'requires_agent') {
        formData.value.ruleConfig = { requiresAgent: value }
      }
    },
  })

  watch(
    () => formData.value.ruleType,
    (newType) => {
      switch (newType) {
        case 'required_fields':
          formData.value.ruleConfig = { fields: [] }
          break
        case 'requires_agent':
          formData.value.ruleConfig = { requiresAgent: false }
          break
        case 'conditional_validation':
          formData.value.ruleConfig = { field: '', dependsOn: '', condition: 'equals', value: '' }
          break
        case 'validation_message':
          formData.value.ruleConfig = { field: '', messageType: 'required' }
          break
      }
    }
  )

  const openCreateDialog = (): void => {
    editingRule.value = null
    formData.value = {
      blockInstanceId: selectedBlockId.value ?? toGlobalEntityId(''),
      ruleType: 'required_fields',
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
      ruleType: 'required_fields',
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
      case 'required_fields': {
        const reqFields = rule.ruleConfig as { fields: string[]; condition?: string }
        return `Fields: ${reqFields.fields.join(', ')}${reqFields.condition ? ` (Condition: ${reqFields.condition})` : ''}`
      }
      case 'requires_agent': {
        const reqAgent = rule.ruleConfig as { requiresAgent: boolean }
        return `Requires Agent: ${reqAgent.requiresAgent ? 'Yes' : 'No'}`
      }
      case 'conditional_validation': {
        const condVal = rule.ruleConfig as { field: string; dependsOn: string; condition: string; value: unknown }
        return `${condVal.field} ${condVal.condition} ${condVal.value} (depends on ${condVal.dependsOn})`
      }
      case 'validation_message': {
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
