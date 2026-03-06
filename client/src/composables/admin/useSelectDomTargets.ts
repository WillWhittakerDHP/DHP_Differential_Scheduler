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
  const { fieldContext } = options

  const selectDomTargets = computed(() => {
    const fieldKeyString = String(fieldContext.state.fieldKey)
    const id = `field-${fieldKeyString}`
    return [{ appSelectId: `app-select-${id}`, expectedName: fieldKeyString }]
  })

  return {
    selectDomTargets
  }
}
