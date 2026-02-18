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
import type { GlobalEntityId } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import {
  BUSINESS_RULES_API_BASE,
  BUSINESS_RULES_MESSAGES,
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
 * LEARNING: TypeScript union type matching server-side RuleType
 * WHY: Type safety for rule_type field
 * PATTERN: Discriminated union based on rule_type
 */
export type RuleType = 
  | 'required_fields'        // Additional required fields based on block selection
  | 'requires_agent'         // Service requires agent/client contact information
  | 'conditional_validation' // Field validation depends on other field values
  | 'validation_message'     // Custom validation messages for fields/blocks

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
export interface BusinessRule {
  id: GlobalEntityId
  blockInstanceId: GlobalEntityId
  ruleType: RuleType
  ruleConfig: RuleConfig
  validationMessageAnnotationId: GlobalEntityId | null
  active: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Business Rule Form Data
 * LEARNING: Form data structure for creating/editing business rules
 * WHY: Separates form state from API response data
 * PATTERN: Omit id/timestamps for create, include for update
 */
export interface BusinessRuleFormData {
  blockInstanceId: GlobalEntityId
  ruleType: RuleType
  ruleConfig: RuleConfig
  validationMessageAnnotationId: GlobalEntityId | null
  active: boolean
}

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
    loading.value = true
    error.value = null

    try {
      const queryString = buildBusinessRulesQueryString(filters)
      const url = `${BUSINESS_RULES_API_BASE}${queryString ? `?${queryString}` : ''}`

      const response = await apiClient.get<BusinessRule[]>(url)
      rules.value = response.data ?? []
    } catch (err) {
      logger.error('Error fetching business rules', { error: err })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_LOAD
      rules.value = []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch business rules for specific block instance
   * LEARNING: GET /api/v1/internal/business-rules/block/:blockInstanceId
   * WHY: Wizard needs to load rules for all selected services/dwelling adjustments
   * PATTERN: Async function with loading state, returns only active rules
   */
  const fetchRulesByBlock = async (blockInstanceId: GlobalEntityId): Promise<BusinessRule[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.get<BusinessRule[]>(`${BUSINESS_RULES_API_BASE}/block/${blockInstanceId}`)
      return response.data ?? []
    } catch (err) {
      logger.error('Error fetching business rules for block', { error: err, blockInstanceId })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_LOAD_FOR_BLOCK
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Create new business rule
   * LEARNING: POST /api/v1/internal/business-rules
   * WHY: Admin creates new validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
   */
  const createRule = async (formData: BusinessRuleFormData): Promise<BusinessRule | null> => {
    saving.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.post<BusinessRule>(BUSINESS_RULES_API_BASE, formData)

      if (response.data) {
        success.value = BUSINESS_RULES_MESSAGES.CREATED
        await fetchRules()
        return response.data
      }

      return null
    } catch (err) {
      logger.error('Error creating business rule', { error: err })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_CREATE
      return null
    } finally {
      saving.value = false
    }
  }
  
  /**
   * Update existing business rule
   * LEARNING: PUT /api/v1/internal/business-rules/:id
   * WHY: Admin edits existing validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
   */
  const updateRule = async (id: GlobalEntityId, formData: BusinessRuleFormData): Promise<BusinessRule | null> => {
    saving.value = true
    error.value = null
    success.value = null

    try {
      const response = await apiClient.put<BusinessRule>(`${BUSINESS_RULES_API_BASE}/${id}`, formData)

      if (response.data) {
        success.value = BUSINESS_RULES_MESSAGES.UPDATED
        await fetchRules()
        return response.data
      }

      return null
    } catch (err) {
      logger.error('Error updating business rule', { error: err, id, formData })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_UPDATE
      return null
    } finally {
      saving.value = false
    }
  }
  
  /**
   * Delete business rule
   * LEARNING: DELETE /api/v1/internal/business-rules/:id
   * WHY: Admin removes validation rules via admin panel
   * PATTERN: Async function with saving state, success message, auto-refresh
   */
  const deleteRule = async (id: GlobalEntityId): Promise<boolean> => {
    saving.value = true
    error.value = null
    success.value = null

    try {
      await apiClient.delete(`${BUSINESS_RULES_API_BASE}/${id}`)
      success.value = BUSINESS_RULES_MESSAGES.DELETED
      await fetchRules()
      return true
    } catch (err) {
      logger.error('Error deleting business rule', { error: err, id })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_DELETE
      return false
    } finally {
      saving.value = false
    }
  }
  
  /**
   * Toggle business rule active status
   * LEARNING: PATCH /api/v1/internal/business-rules/:id with { active }
   * WHY: Admin enables/disables validation rules without deleting
   * PATTERN: Async function using PATCH for partial update
   */
  const toggleRuleActive = async (id: GlobalEntityId, active: boolean): Promise<boolean> => {
    saving.value = true
    error.value = null

    try {
      await apiClient.put(`${BUSINESS_RULES_API_BASE}/${id}`, { active })
      success.value = active ? BUSINESS_RULES_MESSAGES.ENABLED : BUSINESS_RULES_MESSAGES.DISABLED
      await fetchRules()
      return true
    } catch (err) {
      logger.error('Error toggling business rule', { error: err, id, active })
      error.value = err instanceof Error ? err.message : BUSINESS_RULES_MESSAGES.FAILED_TO_TOGGLE
      return false
    } finally {
      saving.value = false
    }
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
