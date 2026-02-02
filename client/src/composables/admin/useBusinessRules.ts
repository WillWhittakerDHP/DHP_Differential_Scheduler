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

/**
 * Required Fields Rule Config
 * LEARNING: Defines additional required fields when block is selected
 * WHY: Multi-family properties require numberOfUnits, some services require specific fields
 * PATTERN: Array of field names with optional condition
 */
export interface RequiredFieldsRuleConfig {
  fields: string[]           // Array of field names that become required
  condition?: string         // Optional condition (e.g., "isMultiFamily", "hasDeck")
}

/**
 * Requires Agent Rule Config
 * LEARNING: Indicates service requires agent/client contact information
 * WHY: Some services need agent details (e.g., Buyers Inspection), others don't
 * PATTERN: Simple boolean flag
 */
export interface RequiresAgentRuleConfig {
  requiresAgent: boolean
}

/**
 * Conditional Validation Rule Config
 * LEARNING: Field validation depends on other field values
 * WHY: Complex validation logic (e.g., field X required when field Y equals value Z)
 * PATTERN: Dependent field, condition type, condition value
 */
export interface ConditionalValidationRuleConfig {
  field: string              // Field to validate
  dependsOn: string          // Field that determines validation
  condition: string          // Condition type (e.g., "equals", "contains", "greaterThan")
  value: unknown             // Value to compare against
}

/**
 * Validation Message Rule Config
 * LEARNING: Custom validation messages for fields/blocks
 * WHY: Admin-configurable error messages instead of hardcoded strings
 * PATTERN: Field name and message type
 */
export interface ValidationMessageRuleConfig {
  field: string              // Field this message applies to
  messageType: 'required' | 'invalid' | 'custom' // Type of validation message
}

/**
 * Rule Config Union Type
 * LEARNING: TypeScript union type for all possible rule configs
 * WHY: Type safety for JSONB field based on rule_type
 * PATTERN: Discriminated union based on rule_type
 */
export type RuleConfig = 
  | RequiredFieldsRuleConfig 
  | RequiresAgentRuleConfig 
  | ConditionalValidationRuleConfig
  | ValidationMessageRuleConfig

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
      const queryParams = new URLSearchParams()
      if (filters?.blockInstanceId) queryParams.append('blockInstanceId', filters.blockInstanceId)
      if (filters?.ruleType) queryParams.append('ruleType', filters.ruleType)
      if (filters?.active !== undefined) queryParams.append('active', String(filters.active))
      
      const queryString = queryParams.toString()
      const url = `/internal/business-rules${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get<BusinessRule[]>(url)
      rules.value = response.data || []
    } catch (err) {
      logger.error('Error fetching business rules', { error: err })
      error.value = err instanceof Error ? err.message : 'Failed to load business rules'
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
      const response = await apiClient.get<BusinessRule[]>(`/internal/business-rules/block/${blockInstanceId}`)
      return response.data || []
    } catch (err) {
      logger.error('Error fetching business rules for block', { error: err, blockInstanceId })
      error.value = err instanceof Error ? err.message : 'Failed to load business rules for block'
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
      const response = await apiClient.post<BusinessRule>('/internal/business-rules', formData)
      
      if (response.data) {
        success.value = 'Business rule created successfully'
        await fetchRules()
        return response.data
      }
      
      return null
    } catch (err) {
      console.error('Error creating business rule:', err)
      error.value = err instanceof Error ? err.message : 'Failed to create business rule'
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
      const response = await apiClient.put<BusinessRule>(`/internal/business-rules/${id}`, formData)
      
      if (response.data) {
        success.value = 'Business rule updated successfully'
        await fetchRules()
        return response.data
      }
      
      return null
    } catch (err) {
      logger.error('Error updating business rule', { error: err, id, formData })
      error.value = err instanceof Error ? err.message : 'Failed to update business rule'
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
      await apiClient.delete(`/internal/business-rules/${id}`)
      success.value = 'Business rule deleted successfully'
      await fetchRules()
      return true
    } catch (err) {
      console.error('Error deleting business rule:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete business rule'
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
      await apiClient.put(`/internal/business-rules/${id}`, { active })
      success.value = active ? 'Business rule enabled' : 'Business rule disabled'
      await fetchRules()
      return true
    } catch (err) {
      logger.error('Error toggling business rule', { error: err, id, active })
      error.value = err instanceof Error ? err.message : 'Failed to toggle business rule'
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
