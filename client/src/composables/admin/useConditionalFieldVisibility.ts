/**
 * LEARNING: Conditional Field Visibility Filtering
 * WHY: Encapsulates business logic for filtering fields based on conditions (composable/composite)
 * PATTERN: Composable for filtering field locations based on entity properties and form values
 * 
 * Used by:
 * - EntityCard.vue
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'

export interface FieldsByLocation {
  titleRow: GlobalFieldKey<GlobalEntityKey>[]
  directInline: GlobalFieldKey<GlobalEntityKey>[]
  directStacked: GlobalFieldKey<GlobalEntityKey>[]
  subPanels: {
    parts: GlobalFieldKey<GlobalEntityKey>[]
    relationships: GlobalFieldKey<GlobalEntityKey>[]
    annotations: GlobalFieldKey<GlobalEntityKey>[]
    events: GlobalFieldKey<GlobalEntityKey>[]
  }
  hidden: GlobalFieldKey<GlobalEntityKey>[]
}

export interface UseConditionalFieldVisibilityOptions {
  fieldsByLocation: ComputedRef<FieldsByLocation>
  entityKey: GlobalEntityKey
  isComposable: ComputedRef<boolean>
  form: FormContext
}

export interface UseConditionalFieldVisibilityReturn {
  filteredFieldsByLocation: ComputedRef<FieldsByLocation>
}

/**
 * LEARNING: Filter fields based on conditional visibility rules
 * WHY: Some fields should only show under certain conditions (e.g., composite when composable=true)
 * PATTERN: Filter fieldsByLocation based on business rules
 */
export function useConditionalFieldVisibility(
  options: UseConditionalFieldVisibilityOptions
): UseConditionalFieldVisibilityReturn {
  const { fieldsByLocation, isComposable, form } = options

  const filteredFieldsByLocation = computed<FieldsByLocation>(() => {
    const base = fieldsByLocation.value
    
    // Get form values for conditional checks
    const formValues = form.values
    
    // Filter composite field: only show when BlockShape.composable === true
    const filteredDirectStacked = base.directStacked.filter(fieldKey => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })
    
    const filteredDirectInline = base.directInline.filter(fieldKey => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })
    
    // Filter instanceComponents: only show when composite=true AND composable=true
    const filteredRelationships = base.subPanels.relationships.filter(fieldKey => {
      if (String(fieldKey) === 'instanceComponents') {
        const compositeValue = formValues.composite === true
        return compositeValue && isComposable.value === true
      }
      return true
    })
    
    return {
      ...base,
      directInline: filteredDirectInline,
      directStacked: filteredDirectStacked,
      subPanels: {
        ...base.subPanels,
        relationships: filteredRelationships,
        events: base.subPanels.events || []
      }
    }
  })

  return {
    filteredFieldsByLocation,
  }
}
