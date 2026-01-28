/**
 * Select Field Value Composable
 * 
 * LEARNING: Extracts field value normalization and validation logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - value normalization belongs in composables
 * PATTERN: Composable that provides normalized field value with option validation
 * 
 * This composable handles:
 * - Annotation value extraction from relationships
 * - Value normalization (array for multiple, string for single)
 * - Option validation (filter out invalid values)
 * - Debug logging for filtered values
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { SelectOption } from '@/composables/useSelectOptions'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { UseAnnotationSelectReturn } from './useAnnotationSelect'
import type { UseSelectFilteringReturn } from './useSelectFiltering'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

/**
 * Select Field Value Composable Options
 */
export interface UseSelectFieldValueOptions {
  /**
   * Raw field value from form
   */
  rawFieldValue: ReadonlyVueRef<unknown>
  
  /**
   * Whether this is a DescriptionSelect field
   */
  isDescriptionSelect: ComputedRef<boolean>
  
  /**
   * Whether select allows multiple selections
   */
  isMultiple: ComputedRef<boolean>
  
  /**
   * Options array for validation
   */
  options: ReadonlyVueRef<SelectOption[]>
  
  /**
   * Annotation select composable return (for annotation handling)
   */
  annotationSelect?: UseAnnotationSelectReturn
  
  /**
   * Select filtering composable return (for parent type entity access)
   */
  selectFiltering?: UseSelectFilteringReturn
  
  /**
   * Field context
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

/**
 * Select Field Value Composable Return Type
 */
export interface UseSelectFieldValueReturn {
  /**
   * Normalized field value for display with option validation
   */
  fieldValue: ComputedRef<string | string[] | null>
}

/**
 * Select Field Value Composable
 * 
 * LEARNING: Provides field value normalization logic extracted from SelectInputs component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with computed property for normalized field value
 */
export function useSelectFieldValue(
  options: UseSelectFieldValueOptions
): UseSelectFieldValueReturn {
  const {
    rawFieldValue,
    isDescriptionSelect,
    isMultiple,
    options: selectOptions,
    annotationSelect
  } = options

  /**
   * LEARNING: Normalize field value for display with option validation
   * WHY: AppSelect with multiple prop expects an array, but stored value might be string or single value
   *      Need to filter out invalid values that don't exist in options
   * PATTERN: Convert to array for multiple selects, ensure it's always an array when multiple is true
   *          Filter out values that don't exist in options to prevent "enabled nodes mismatch" errors
   */
  const fieldValue = computed(() => {
    // LEARNING: For DescriptionSelect, use AnnotationAssignment relationships as source of truth
    // WHY: Annotations are linked via AnnotationAssignment through-table, not stored directly on blockInstance
    // PATTERN: Get annotation IDs from relationships when DescriptionSelect is detected
    if (isDescriptionSelect.value && annotationSelect?.blockInstanceId.value) {
      // LEARNING: Safety check - blockInstanceAnnotations might be undefined if query hasn't run yet
      // WHY: Vue Query returns undefined initially, even with default value, when query is disabled
      // PATTERN: Check for array before calling map
      const relationships = annotationSelect.blockInstanceAnnotations.value || []
      const annotationIds = relationships.map(rel => rel.annotationId)
      // Return array for multiple select, or first item for single select
      return isMultiple.value ? annotationIds : (annotationIds[0] || null)
    }
    
    const value = rawFieldValue.value
    
    // LEARNING: Extract option values for validation - handle both flat and grouped options
    // WHY: Need to check if selected values exist in options to prevent "enabled nodes mismatch" errors
    // PATTERN: Flatten grouped options (children) and flat options into a single Set for O(1) lookup
    const optionValues = new Set(
      selectOptions.value.flatMap(opt =>
        opt.children && Array.isArray(opt.children)
          ? opt.children.map(child => String(child.value))
          : [String(opt.value)]
      )
    )
    
    // For multiple selects, ensure value is always an array of strings
    if (isMultiple.value) {
      if (Array.isArray(value)) {
        // Ensure all values are strings (item-value uses String(entity.id))
        const normalized = value.map(v => String(v)).filter(v => v !== '')
        
        // LEARNING: Filter out values that don't exist in options
        // WHY: Prevents "The number of enabled nodes does not match the number of values" error
        //      This can happen when entities are filtered out or disabled after save
        // PATTERN: Only include values that exist in the options array
        const validValues = normalized.filter(v => optionValues.has(v))
        
        // LEARNING: Only warn if values were filtered out AND entities exist (not just deleted)
        // WHY: Reduces noise - if entities don't exist, they're already handled. Only warn when
        //      validCascades/validParts changed and filtered out valid entities
        // PATTERN: Check if missing entities actually exist before warning
        if (isDevModeEnabled() && normalized.length !== validValues.length) {
          // NOTE: Debugging code removed - missingValues computation was not used
          // Only warn if entities exist but were filtered out (indicates validCascades/validParts changed)
        }
        
        return validValues
      }
      if (value === null || value === undefined || value === '') {
        return []
      }
      // If it's a string, convert to array with string value, but only if it exists in options
      if (typeof value === 'string') {
        const stringValue = String(value)
        return optionValues.has(stringValue) ? [stringValue] : []
      }
      // For any other type (number, etc.), convert to string and wrap in array, but only if it exists in options
      const stringValue = String(value)
      return optionValues.has(stringValue) ? [stringValue] : []
    }
    
    // For single selects, ensure value is string to match item-value format
    // LEARNING: Return null if value doesn't exist in options
    // WHY: Prevents "enabled nodes mismatch" error when selected value is filtered out
    // PATTERN: Check if value exists in options before returning it
    if (value === null || value === undefined || value === '') {
      return null
    }
    const stringValue = String(value)
    // Return null if value doesn't exist in options (entity was filtered out or disabled)
    return optionValues.has(stringValue) ? stringValue : null
  })

  return {
    fieldValue
  }
}

