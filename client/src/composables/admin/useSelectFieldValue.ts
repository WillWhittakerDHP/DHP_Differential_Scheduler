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
import type { UseSelectFilteringReturn } from './useSelectFiltering'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectFieldValueOptions {
  rawFieldValue: ReadonlyVueRef<unknown>
  
  isMultiple: ComputedRef<boolean>
  
  options: ReadonlyVueRef<SelectOption[]>
  
  selectFiltering?: UseSelectFilteringReturn
  
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  /**
   * Whether this is an AnnotationAssignmentSelect field
   * LEARNING: Annotations are now core entities, use standard relationship select pattern
   */
  isAnnotationAssignmentSelect?: ComputedRef<boolean>
}

export interface UseSelectFieldValueReturn {
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
    isMultiple,
    options: selectOptions,
    fieldContext
  } = options

  /**
   * LEARNING: Normalize field value for display with option validation
   * WHY: AppSelect with multiple prop expects an array, but stored value might be string or single value
   *      Need to filter out invalid values that don't exist in options
   * PATTERN: Convert to array for multiple selects, ensure it's always an array when multiple is true
   *          Filter out values that don't exist in options to prevent "enabled nodes mismatch" errors
   * 
   * LEARNING: Annotations now work like other relationship selects
   * WHY: annotationAssignments is attached to entities by transformer, value comes from rawFieldValue
   * PATTERN: No special handling needed - annotations use same pattern as partAssignments
   */
  const fieldValue = computed(() => {
    const value = rawFieldValue.value
    
    // PATTERN: Flatten grouped options (children) and flat options into a single Set for O(1) lookup
    const optionValues = new Set(
      selectOptions.value.flatMap(opt =>
        opt.children && Array.isArray(opt.children)
          ? opt.children.map(child => String(child.value))
          : [String(opt.value)]
      )
    )
    
    if (isMultiple.value) {
      if (Array.isArray(value)) {
        const normalized = value.map(v => String(v)).filter(v => v !== '')
        
        // PATTERN: Only include values that exist in the options array
        const validValues = normalized.filter(v => optionValues.has(v))
        
        // PATTERN: Check if missing entities actually exist before warning
        if (isDevModeEnabled() && normalized.length !== validValues.length) {
        }
        
        return validValues
      }
      if (value === null || value === undefined || value === '') {
        return []
      }
      if (typeof value === 'string') {
        const stringValue = String(value)
        return optionValues.has(stringValue) ? [stringValue] : []
      }
      const stringValue = String(value)
      return optionValues.has(stringValue) ? [stringValue] : []
    }
    
    // PATTERN: Check if value exists in options before returning it
    if (value === null || value === undefined || value === '') {
      // LEARNING: Convert null to '__NULL__' sentinel for ternaryDefault field
      // PATTERN: Convert null to '__NULL__' when reading, convert back to null when saving
      if (value === null && String(fieldContext.fieldKey) === 'ternaryDefault') {
        return '__NULL__' // Convert null to sentinel for display
      }
      return null
    }
    const stringValue = String(value)
    if (stringValue === '__NULL__' && String(fieldContext.fieldKey) === 'ternaryDefault') {
      return '__NULL__' // Keep sentinel for display
    }
    return optionValues.has(stringValue) ? stringValue : null
  })

  return {
    fieldValue
  }
}

