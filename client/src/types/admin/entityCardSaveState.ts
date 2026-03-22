import type { ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { EntityCardSharedProps } from '@/components/admin/generic/entityCardConstants'

export interface UseEntityCardSaveStateOptions extends EntityCardSharedProps {
  form: FormContext
  getEntityValues: () => Record<string, unknown>
}

export interface UseEntityCardSaveStateReturn {
  canSave: ComputedRef<boolean>
  hasChanges: ComputedRef<boolean>
  markStatusButtonChanged: (fieldKey: string) => void
  resetSaveState: () => void
  isStatusButtonChanged: (fieldKey: string) => boolean
}
