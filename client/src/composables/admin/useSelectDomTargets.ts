/**
 * WHY: useSelectDomTargets Composable

WHY: Moves DOM association target calcul...
 */
import { computed } from 'vue'
import type { UseSelectDomTargetsOptions, UseSelectDomTargetsReturn } from '@/types/admin/selectDomTargets'

export type { SelectDomTarget } from '@/utils/forms/selectDomAssociation'

/**
 * WHY: Select DOM targets composable
WHY: Extracts DOM target calculation logic...
 */
export function useSelectDomTargets(
  options: UseSelectDomTargetsOptions
): UseSelectDomTargetsReturn {
  const { fieldContext, shouldUseMultipleSelects, groupedByKey } = options

  const selectDomTargets = computed(() => {
    const fieldKeyString = String(fieldContext.state.fieldKey)

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
