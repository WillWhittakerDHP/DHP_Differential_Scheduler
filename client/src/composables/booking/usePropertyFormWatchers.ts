/**
 * WHY: usePropertyFormWatchers Composable
 * WHY: Moves MLS data syncing and load...
 */
import type { UsePropertyFormWatchersParams, UsePropertyFormWatchersReturn } from '@/types/booking/propertyFormWatchers'
import {
  registerPropertyFormFieldWatchers,
  registerPropertyFormRestoreFromWatch,
  registerPropertyFormWizardRestoreWatch,
} from '@/composables/booking/registerPropertyFormFieldWatchers'

/**
 * WHY: usePropertyFormWatchers composable
 * WHY: Extracts watcher logic from com...
 */
export function usePropertyFormWatchers(params: UsePropertyFormWatchersParams): UsePropertyFormWatchersReturn {
  const { formData, loadedWizardState, isAddressExpanded, restoreFrom } = params

  registerPropertyFormFieldWatchers(formData)
  registerPropertyFormWizardRestoreWatch({ formData, loadedWizardState, isAddressExpanded })
  registerPropertyFormRestoreFromWatch({ formData, restoreFrom, isAddressExpanded })

  return {}
}
