/**
 * WHY: useSelectDomTargets Composable

WHY: Moves DOM association target calcul...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'
import type { SelectGroup } from '@/types/entity/selectOptions'

export type { SelectDomTarget }
export type { SelectGroup }

export interface UseSelectDomTargetsOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  
  shouldUseMultipleSelects: ComputedRef<boolean>
  
  groupedByKey: ComputedRef<SelectGroup[]>
}

export interface UseSelectDomTargetsReturn {
  selectDomTargets: ComputedRef<SelectDomTarget[]>
}

/**
 * WHY: Select DOM targets composable
WHY: Extracts DOM target calculation logic...
 */
export function useSelectDomTargets(
  options: UseSelectDomTargetsOptions
): UseSelectDomTargetsReturn {
  const { fieldContext, shouldUseMultipleSelects, groupedByKey } = options

  /**
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
