/**
 * useSelectDomTargets Composable
 * 
 * LEARNING: Extracts DOM target calculation logic from SelectInputs component
 * WHY: Moves DOM association target calculation out of component into reusable composable
 * PATTERN: Composable that calculates DOM targets for form association
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'

export type { SelectDomTarget }

export interface SelectGroup {
  groupKey: string
  groupLabel: string
}

export interface UseSelectDomTargetsOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  shouldUseMultipleSelects: ComputedRef<boolean>
  
  groupedByKey: ComputedRef<SelectGroup[]>
}

export interface UseSelectDomTargetsReturn {
  selectDomTargets: ComputedRef<SelectDomTarget[]>
}

/**
 * LEARNING: Select DOM targets composable
 * WHY: Extracts DOM target calculation logic from component to composable
 * PATTERN: Composable that calculates DOM targets for form association
 */
export function useSelectDomTargets(
  options: UseSelectDomTargetsOptions
): UseSelectDomTargetsReturn {
  const { fieldContext, shouldUseMultipleSelects, groupedByKey } = options

  /**
   * LEARNING: Calculate DOM targets for form association
   * WHY: Browser extensions need predictable DOM structure for form filling
   * PATTERN: Generate targets based on whether using multiple selects or single select
   */
  const selectDomTargets = computed(() => {
    const fieldKeyString = String(fieldContext.fieldKey)

    if (shouldUseMultipleSelects.value) {
      // WHY: Functional approach avoids mutations, aligns with workspace rules
      // PATTERN: Map groups to DOM targets instead of forEach with mutations
      return groupedByKey.value.map(group => {
        const id = `field-${fieldKeyString}-${group.groupKey}`
        return {
          appSelectId: `app-select-${id}`,
          expectedName: `${fieldKeyString}-${group.groupKey}`,
        }
      })
    }

    const id = `field-${fieldKeyString}`
    return [{ appSelectId: `app-select-${id}`, expectedName: fieldKeyString }]
  })

  return {
    selectDomTargets
  }
}
