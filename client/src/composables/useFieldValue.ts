/**
 * WHY: Unified Field Value Access Composable

WHY: Vue unwraps Refs when passed...
 */
import { computed, type Ref } from 'vue'
import type { ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from './fieldContext/types'

/**
 * WHY: Unified field value composable

WHY: Vue may unwrap Refs when fieldConte...
 */
export function useFieldValue<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldContext: FieldContextTypeGrouped<GE, FieldKey>
): Ref<ValidAdminValue> {
  // PATTERN: Directly access fieldContext.state.value.value to establish reactivity dependency
  // NOTE: Grouped format - value is at context.state.value (Ref<ValidAdminValue>)
  return computed(() => {
    // LEARNING: Handle Vue's Ref unwrapping when fieldContext is passed as prop
    // WHY: Vue may unwrap Refs when passed as props, so fieldContext.state.value might be:
    //      1. A Ref object with .value property (normal case from vee-validate)
    // PATTERN: Check if fieldContext.state.value is a Ref or already the value
    const valueRef = fieldContext.state.value
    
    if (valueRef === undefined || valueRef === null) {
      return '' as ValidAdminValue
    }
    
    let actualValue: ValidAdminValue
    const isRefLike = typeof valueRef === 'object' && valueRef !== null && 'value' in valueRef
    if (isRefLike) {
      actualValue = (valueRef as { value: ValidAdminValue }).value
    } else {
      // FIX: This case indicates the Ref was unwrapped, which breaks reactivity
      const formValues = fieldContext.state.formInstance?.values as Record<string, unknown> | undefined
      const formValue = formValues ? formValues[String(fieldContext.state.fieldKey)] : undefined
      actualValue = (formValue ?? valueRef) as ValidAdminValue
    }

    return (actualValue !== undefined && actualValue !== null ? actualValue : '') as ValidAdminValue
  })
}



