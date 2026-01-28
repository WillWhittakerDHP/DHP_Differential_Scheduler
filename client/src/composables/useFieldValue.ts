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
    // LEARNING: Handle Vue's Ref unwrapping when fieldContext is passed as prop
    // WHY: Vue may unwrap Refs when passed as props, so fieldContext.value might be:
    //      1. A Ref object with .value property (normal case from vee-validate)
    //      2. The actual value directly (Vue unwrapped it when passed as prop)
    // PATTERN: Check if fieldContext.value is a Ref or already the value
    const valueRef = fieldContext.value
    
    // If valueRef is undefined or null, return empty string
    if (valueRef === undefined || valueRef === null) {
      return '' as ValidAdminValue
    }
    
    // Check if valueRef is a Ref (has .value property) or already unwrapped
    let actualValue: ValidAdminValue
    const isRefLike = typeof valueRef === 'object' && valueRef !== null && 'value' in valueRef
    if (isRefLike) {
      // It's a Ref, access .value to get the actual value (preserves reactivity)
      actualValue = (valueRef as { value: ValidAdminValue }).value
    } else {
      // Vue unwrapped it, use directly (but we've lost reactivity - this shouldn't happen)
      // FIX: This case indicates the Ref was unwrapped, which breaks reactivity
      const formValues = fieldContext.formInstance?.values as Record<string, unknown> | undefined
      const formValue = formValues ? formValues[String(fieldContext.fieldKey)] : undefined
      actualValue = (formValue ?? valueRef) as ValidAdminValue
    }

    // Return empty string if value is undefined/null
    return (actualValue ?? '') as ValidAdminValue
  }) as Ref<ValidAdminValue>
}



