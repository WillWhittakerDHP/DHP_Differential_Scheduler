import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'
/**
 * WHY: Business Rule Form composable
WHY: Extracts form state, rule-type config...
 */
import { ref, watch, type Ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { RULE_TYPE_OPTIONS } from '@/constants/businessRulesConstants.js'
import {
  buildRequiredFieldsArrayWritable,
  buildRequiredFieldsConditionWritable,
  buildRequiresAgentWritable,
  businessRuleFormDataFromRule,
  createEmptyBusinessRuleFormData,
  defaultRuleConfigForRuleType,
  emptyBlockIdPlaceholder,
  formatBusinessRuleConfigSummary,
  formatBusinessRuleTypeLabel,
} from '@/utils/admin/businessRuleFormComputeds'

export interface UseBusinessRuleFormReturn {
  formData: Ref<BusinessRuleFormData>
  editingRule: Ref<BusinessRule | null>
  showRuleDialog: Ref<boolean>
  ruleTypeOptions: typeof RULE_TYPE_OPTIONS
  requiredFieldsArray: import('vue').WritableComputedRef<string>
  requiredFieldsCondition: import('vue').WritableComputedRef<string>
  requiresAgent: import('vue').WritableComputedRef<boolean>
  openCreateDialog: () => void
  openEditDialog: (rule: BusinessRule) => void
  closeDialog: () => void
  formatRuleType: (ruleType: RuleType) => string
  formatRuleConfig: (rule: BusinessRule) => string
}

export function useBusinessRuleForm(selectedBlockId: Ref<GlobalEntityId | null>): UseBusinessRuleFormReturn {
  const showRuleDialog = ref<boolean>(false)
  const editingRule: Ref<BusinessRule | null> = ref(null)

  const formData: Ref<BusinessRuleFormData> = ref(
    createEmptyBusinessRuleFormData(selectedBlockId.value ?? emptyBlockIdPlaceholder())
  )

  const requiredFieldsArray = buildRequiredFieldsArrayWritable(formData)
  const requiredFieldsCondition = buildRequiredFieldsConditionWritable(formData)
  const requiresAgent = buildRequiresAgentWritable(formData)

  watch(
    () => formData.value.ruleType,
    (newType) => {
      formData.value.ruleConfig = defaultRuleConfigForRuleType(newType)
    }
  )

  const openCreateDialog = (): void => {
    editingRule.value = null
    formData.value = createEmptyBusinessRuleFormData(selectedBlockId.value ?? emptyBlockIdPlaceholder())
    showRuleDialog.value = true
  }

  const openEditDialog = (rule: BusinessRule): void => {
    editingRule.value = rule
    formData.value = businessRuleFormDataFromRule(rule)
    showRuleDialog.value = true
  }

  const closeDialog = (): void => {
    showRuleDialog.value = false
    editingRule.value = null
    formData.value = createEmptyBusinessRuleFormData(selectedBlockId.value ?? emptyBlockIdPlaceholder())
  }

  const formatRuleType = (ruleType: RuleType): string => formatBusinessRuleTypeLabel(ruleType)

  const formatRuleConfig = (rule: BusinessRule): string => formatBusinessRuleConfigSummary(rule)

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
