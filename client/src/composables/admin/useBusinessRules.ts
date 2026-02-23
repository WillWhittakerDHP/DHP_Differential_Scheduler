/**
 * WHY: Business Rules Composable

PATTERN: Composable handles API calls, state ...
 */
import { ref, type Ref } from 'vue'
import apiClient from '@/utils/api'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'
import { withAsyncOperation } from '@/utils/async/withAsyncOperation'
import {
  BUSINESS_RULES_API_BASE,
  BUSINESS_RULES_MESSAGES,
  RULE_TYPE_VALUES,
} from '@/constants/businessRulesConstants.js'
import type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
} from '@shared/types/businessRulesTypes'

const logger = createLogger('useBusinessRules')

/** Build query string from filters without mutating (audit: loop-mutation) */
function buildBusinessRulesQueryString(filters?: {
  blockInstanceId?: GlobalEntityId
  ruleType?: RuleType
  active?: boolean
}): string {
  if (!filters) return ''
  const entries: [string, string][] = []
  if (filters.blockInstanceId) entries.push(['blockInstanceId', filters.blockInstanceId])
  if (filters.ruleType) entries.push(['ruleType', filters.ruleType])
  if (filters.active !== undefined) entries.push(['active', String(filters.active)])
  if (entries.length === 0) return ''
  return new URLSearchParams(entries).toString()
}

/**
 * Rule Type Enumeration
 */
export type RuleType = (typeof RULE_TYPE_VALUES)[keyof typeof RULE_TYPE_VALUES]

export type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
}

/**
 * Business Rule Model
 */
/** Shared core shape (P2 type-similarity); form data and API entity extend. */
export interface BusinessRuleCore {
  blockInstanceId: GlobalEntityId
  ruleType: RuleType
  ruleConfig: RuleConfig
  validationMessageAnnotationId: GlobalEntityId | null
  active: boolean
}

export interface BusinessRule extends BusinessRuleCore {
  id: GlobalEntityId
  createdAt: string
  updatedAt: string
}

/**
 * WHY: Business Rule Form Data
WHY: Separates form state from API response data
 */
export type BusinessRuleFormData = BusinessRuleCore

/**
 * PATTERN: Use Business Rules Composable
PATTERN: Composable with loading states, e...
 */
export function useBusinessRules() {
  const rules: Ref<BusinessRule[]> = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error: Ref<string | null> = ref(null)
  const success: Ref<string | null> = ref(null)
  
  /**
   * PATTERN: /**
Fetch all business rules (with optional filters)
PATTERN: Async func...
   */
  const fetchRules = async (filters?: {
    blockInstanceId?: GlobalEntityId
    ruleType?: RuleType
    active?: boolean
  }): Promise<void> => {
    await withAsyncOperation(
      async () => {
        const queryString = buildBusinessRulesQueryString(filters)
        const url = `${BUSINESS_RULES_API_BASE}${queryString ? `?${queryString}` : ''}`
        const response = await apiClient.get<BusinessRule[]>(url)
        rules.value = asEmptyArray(response.data)
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
  
  /**
   * PATTERN: /**
Fetch business rules for specific block instance
PATTERN: Async func...
   */
  const fetchRulesByBlock = async (blockInstanceId: GlobalEntityId): Promise<BusinessRule[]> => {
    const result = await withAsyncOperation(
      async () => {
        const response = await apiClient.get<BusinessRule[]>(
          `${BUSINESS_RULES_API_BASE}/block/${blockInstanceId}`
        )
        return asEmptyArray(response.data)
      },
      { busyRef: loading, errorRef: error },
      {
        logger,
        errorMessage: BUSINESS_RULES_MESSAGES.FAILED_TO_LOAD_FOR_BLOCK,
        errorPrefix: 'Error fetching business rules for block',
      }
    )
    return asEmptyArray(result)
  }
  
  /**
   * PATTERN: /**
Create new business rule
PATTERN: Async function with saving state, ...
   */
  const createRule = async (formData: BusinessRuleFormData): Promise<BusinessRule | null> => {
    const result = await withAsyncOperation(
      async () => {
        const response = await apiClient.post<BusinessRule>(BUSINESS_RULES_API_BASE, formData)
        if (response.data) {
          await fetchRules()
          return response.data
        }
        return null
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
  
  /**
   * PATTERN: /**
Update existing business rule
PATTERN: Async function with saving st...
   */
  const updateRule = async (
    id: GlobalEntityId,
    formData: BusinessRuleFormData
  ): Promise<BusinessRule | null> => {
    const result = await withAsyncOperation(
      async () => {
        const response = await apiClient.put<BusinessRule>(
          `${BUSINESS_RULES_API_BASE}/${id}`,
          formData
        )
        if (response.data) {
          await fetchRules()
          return response.data
        }
        return null
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
  
  /**
   * PATTERN: /**
Delete business rule
PATTERN: Async function with saving state, succ...
   */
  const deleteRule = async (id: GlobalEntityId): Promise<boolean> => {
    const result = await withAsyncOperation(
      async () => {
        await apiClient.delete(`${BUSINESS_RULES_API_BASE}/${id}`)
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
  
  /**
   * Toggle business rule active status
   */
  const toggleRuleActive = async (id: GlobalEntityId, active: boolean): Promise<boolean> => {
    const result = await withAsyncOperation(
      async () => {
        await apiClient.put(`${BUSINESS_RULES_API_BASE}/${id}`, { active })
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
    toggleRuleActive
  }
}
