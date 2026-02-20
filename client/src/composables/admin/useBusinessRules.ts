/**
 * Business Rules Composable
 * 
 * LEARNING: Manages business rules CRUD operations and state
 * WHY: Centralizes all business rules logic - component is pure rendering
 * PATTERN: Composable handles API calls, state management, and validation
 * COMPARISON: Similar to useAvailabilitySettings pattern
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
 * LEARNING: Derived from shared RULE_TYPE_VALUES for single source of truth
 * WHY: Type safety for rule_type field; no inline literals
 */
export type RuleType = (typeof RULE_TYPE_VALUES)[keyof typeof RULE_TYPE_VALUES]

// Re-export shared rule config types (Phase 1.2 type-similarity)
export type {
  ConditionalValidationRuleConfig,
  RequiredFieldsRuleConfig,
  RequiresAgentRuleConfig,
  RuleConfig,
  ValidationMessageRuleConfig,
}

/**
 * Business Rule Model
 * LEARNING: TypeScript interface matching server-side BusinessRule model
 * WHY: Type safety for business rule objects
 * PATTERN: Matches Sequelize model attributes
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
 * Business Rule Form Data
 * LEARNING: Form data structure for creating/editing business rules
 * WHY: Separates form state from API response data
 * PATTERN: Omit id/timestamps for create, include for update
 */
export type BusinessRuleFormData = BusinessRuleCore

/**
 * Use Business Rules Composable
 * LEARNING: Provides reactive state and methods for business rules management
 * WHY: Centralizes all business rules logic - component only handles rendering
 * PATTERN: Composable with loading states, error handling, and CRUD methods
 */
export function useBusinessRules() {
  const rules: Ref<BusinessRule[]> = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const error: Ref<string | null> = ref(null)
  const success: Ref<string | null> = ref(null)
  
  /**
   * Fetch all business rules (with optional filters)
   * LEARNING: GET /api/v1/internal/business-rules with query params
   * WHY: Loads all rules or filters by blockInstanceId, ruleType, active
   * PATTERN: Async function with loading state and error handling
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
   * Fetch business rules for specific block instance
   * LEARNING: GET /api/v1/internal/business-rules/block/:blockInstanceId
   * WHY: Wizard needs to load rules for all selected services/dwelling adjustments
   * PATTERN: Async function with loading state, returns only active rules
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
   * Create new business rule
   * LEARNING: POST /api/v1/internal/business-rules
   * WHY: Admin creates new validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
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
   * Update existing business rule
   * LEARNING: PUT /api/v1/internal/business-rules/:id
   * WHY: Admin edits existing validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
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
   * Delete business rule
   * LEARNING: DELETE /api/v1/internal/business-rules/:id
   * WHY: Admin removes validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
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
   * LEARNING: PATCH /api/v1/internal/business-rules/:id with { active }
   * WHY: Admin enables/disables validation rules without deleting
   * PATTERN: Async function using PATCH for partial update
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
