/**
 * WHY: Select Field Value Composable

WHY: Components should be thin UI wrapper...
 */
import { computed } from 'vue'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { UseSelectFieldValueOptions, UseSelectFieldValueReturn } from '@/types/admin/selectFieldValue'


/**
 * WHY: Select Field Value Composable

WHY: Moves business logic out of componen...
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
        
        // PATTERN: Check if missing entities actually exist before warning (dev-only; no-op here)
        if (isDevModeEnabled() && normalized.length !== validValues.length) {
          void 0
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
      if (value === null && String(fieldContext.state.fieldKey) === 'ternaryDefault') {
        return '__NULL__' // Convert null to sentinel for display
      }
      return null
    }
    const stringValue = String(value)
    if (stringValue === '__NULL__' && String(fieldContext.state.fieldKey) === 'ternaryDefault') {
      return '__NULL__' // Keep sentinel for display
    }
    return optionValues.has(stringValue) ? stringValue : null
  })

  return {
    fieldValue
  }
}

