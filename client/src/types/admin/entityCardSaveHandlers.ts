import type { FormContext } from 'vee-validate'
import type { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityCardSaveStateReturn } from '@/types/admin/entityCardSaveState'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardSaveHandlersParams {
  form: FormContext
  admin: ReturnType<typeof useAdmin>
  entityKey: GlobalEntityKey
  entityId: string
  isNew: boolean
  logger: AppLogger
  _handleSave: () => Promise<void>
  _handleUndo: () => void
  unifiedSaveState: UseEntityCardSaveStateReturn
}
