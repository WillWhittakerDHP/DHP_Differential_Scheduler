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
  // LEARNING: Computed property that safely accesses value
  // WHY: Handles both Ref (when structure preserved) and unwrapped (when Vue unwraps it) cases
  // PATTERN: Check if value is a Ref, if so access .value, otherwise use directly
  return computed(() => {
    const valueRef = fieldContext.value
    
    // If valueRef is undefined or null, return empty string
    if (valueRef === undefined || valueRef === null) {
      return '' as ValidAdminValue
    }
    
    // Check if valueRef is a Ref (has .value property and is an object)
    // LEARNING: Vue Refs are objects with a .value property
    // WHY: Need to distinguish between Ref object and unwrapped primitive
    const isRef = valueRef && typeof valueRef === 'object' && 'value' in valueRef
    
    // If it's a Ref, access .value; otherwise use directly (already unwrapped)
    const actualValue = isRef ? (valueRef as Ref<ValidAdminValue>).value : valueRef as ValidAdminValue
    
    // Return empty string if value is undefined/null
    return (actualValue ?? '') as ValidAdminValue
  }) as Ref<ValidAdminValue>
}



