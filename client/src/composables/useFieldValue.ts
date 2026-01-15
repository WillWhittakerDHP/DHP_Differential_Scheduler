/**
 * Unified Field Value Access Composable
 * 
 * LEARNING: Provides unified pattern for accessing field values that handles Vue's Ref unwrapping
 * WHY: Vue unwraps Refs when passed as props, causing value access issues
 *      This composable provides a single source of truth for value access
 * PATTERN: Always expects Ref structure, handles unwrapping gracefully
 * 
 * COMPARISON: React doesn't have this issue - values are always primitives. Vue's reactivity
 *             system requires handling Ref unwrapping when values are passed as props.
 */

import { computed, type Ref } from 'vue'
import type { ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from './useFieldContext'

/**
 * Unified field value composable
 * 
 * LEARNING: Provides reactive access to field value that handles both Ref and unwrapped cases
 * WHY: Vue may unwrap Refs when fieldContext is passed as props, so we need to handle both
 * PATTERN: Always expect Ref structure, but gracefully handle if Vue unwraps it
 * 
 * @param fieldContext - Field context containing the value Ref
 * @returns Computed ref that always provides the current field value
 */
export function useFieldValue<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldContext: FieldContextType<GE, FieldKey>
): Ref<ValidAdminValue> {
  // LEARNING: Computed property that reactively accesses field value
  // WHY: fieldContext.value is always a Ref from vee-validate, need to access .value to track changes
  // PATTERN: Directly access fieldContext.value.value to establish reactivity dependency
  // NOTE: According to vee-validate docs and FieldContextType, fieldContext.value is always Ref<ValidAdminValue>
  return computed(() => {
    // LEARNING: fieldContext.value is always a Ref<ValidAdminValue> from vee-validate
    // WHY: useField returns a Ref, so fieldContext.value is always a Ref
    // PATTERN: Always access .value to get the actual value and establish reactivity tracking
    const valueRef = fieldContext.value
    
    // If valueRef is undefined or null, return empty string
    if (valueRef === undefined || valueRef === null) {
      return '' as ValidAdminValue
    }
    
    // LEARNING: fieldContext.value is always a Ref from vee-validate
    // WHY: Type system guarantees it, and vee-validate always returns Refs
    // PATTERN: Always access .value to get the actual value and track reactivity
    // NOTE: This ensures Vue's reactivity system tracks changes to the field value
    const actualValue = valueRef.value
    
    // Return empty string if value is undefined/null
    return (actualValue ?? '') as ValidAdminValue
  }) as Ref<ValidAdminValue>
}



