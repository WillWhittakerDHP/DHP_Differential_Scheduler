/**
 * WHY: Business Rules Composable; delegates API to businessRulesApi (audit: composables-logic).
 */
import { ref, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'
import { withAsyncOperation } from '@/composables/useAsyncOperation'
import {
  fetchBusinessRules as apiFetchRules,
  fetchBusinessRulesByBlock as apiFetchRulesByBlock,
  createBusinessRule as apiCreateRule,
  updateBusinessRule as apiUpdateRule,
  deleteBusinessRule as apiDeleteRule,
  toggleBusinessRuleActive as apiToggleRuleActive,
} from '@/utils/admin/businessRulesApi'
import { BUSINESS_RULES_MESSAGES } from '@/constants/businessRulesConstants.js'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BusinessRule, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'

export type { BusinessRule, BusinessRuleCore, BusinessRuleFormData, RuleType } from '@/types/admin/businessRules'

export type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
} from '@shared/types/businessRulesTypes'

const logger = createLogger('useBusinessRules')

export function useBusinessRules() {
  const rules: Ref<BusinessRule[]> = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error: Ref<string | null> = ref(null)
  const success: Ref<string | null> = ref(null)

  const fetchRules = async (filters?: {
    blockInstanceId?: GlobalEntityId
    ruleType?: RuleType
    active?: boolean
  }): Promise<void> => {
    await withAsyncOperation(
      async () => {
        rules.value = await apiFetchRules(filters)
      },
      { busyRef: loading, errorRef: error },
      {
        logger,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_LOAD,
        errorPrefix: 'Error fetching business rules',
        onError: () => {
          rules.value = []
        },
      }
    )
  }

  const fetchRulesByBlock = async (blockInstanceId: GlobalEntityId): Promise<BusinessRule[]> => {
    const result = await withAsyncOperation(
      async () => apiFetchRulesByBlock(blockInstanceId),
      { busyRef: loading, errorRef: error },
      {
        logger,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_LOAD_FOR_BLOCK,
        errorPrefix: 'Error fetching business rules for block',
      }
    )
    return asEmptyArray(result)
  }

  const createRule = async (formData: BusinessRuleFormData): Promise<BusinessRule | null> => {
    const result = await withAsyncOperation(
      async () => {
        const created = await apiCreateRule(formData)
        if (created) await fetchRules()
        return created
      },
      { busyRef: saving, errorRef: error, successRef: success },
      {
        logger,
        successMessage: BUSINESS_RULES_MESSAGES.CREATED,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_CREATE,
        errorPrefix: 'Error creating business rule',
      }
    )
    return result
  }

  const updateRule = async (
    id: GlobalEntityId,
    formData: BusinessRuleFormData
  ): Promise<BusinessRule | null> => {
    const result = await withAsyncOperation(
      async () => {
        const updated = await apiUpdateRule(id, formData)
        if (updated) await fetchRules()
        return updated
      },
      { busyRef: saving, errorRef: error, successRef: success },
      {
        logger,
        successMessage: BUSINESS_RULES_MESSAGES.UPDATED,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_UPDATE,
        errorPrefix: 'Error updating business rule',
      }
    )
    return result
  }

  const deleteRule = async (id: GlobalEntityId): Promise<boolean> => {
    const result = await withAsyncOperation(
      async () => {
        await apiDeleteRule(id)
        await fetchRules()
        return true
      },
      { busyRef: saving, errorRef: error, successRef: success },
      {
        logger,
        successMessage: BUSINESS_RULES_MESSAGES.DELETED,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_DELETE,
        errorPrefix: 'Error deleting business rule',
      }
    )
    return result === true
  }

  const toggleRuleActive = async (id: GlobalEntityId, active: boolean): Promise<boolean> => {
    const result = await withAsyncOperation(
      async () => {
        await apiToggleRuleActive(id, active)
        await fetchRules()
        return true
      },
      { busyRef: saving, errorRef: error, successRef: success },
      {
        logger,
        successMessage: active ? BUSINESS_RULES_MESSAGES.ENABLED : BUSINESS_RULES_MESSAGES.DISABLED,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_TOGGLE,
        errorPrefix: 'Error toggling business rule',
      }
    )
    return result === true
  }

  return {
    rules,
    loading,
    saving,
    error,
    success,
    fetchRules,
    fetchRulesByBlock,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
  }
}
