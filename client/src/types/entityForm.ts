import type { Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { EntityCardSharedProps } from '@/components/admin/generic/entityCardConstants'

export interface UseEntityFormOptions extends EntityCardSharedProps {
  form: FormContext
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
}

export interface UseEntityFormReturn {
  canSave: Ref<boolean>
  hasChanges: Ref<boolean>
  save: () => Promise<void>
  reset: () => void
  validate: () => Promise<boolean>
}
