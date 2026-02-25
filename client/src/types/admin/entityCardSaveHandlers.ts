import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseEntityCardSaveStateReturn } from '@/types/admin/entityCardSaveState'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardSaveHandlersParams {
  form: FormContext
  admin: { getEntity: (key: GlobalEntityKey, id: string) => Record<string, unknown> | undefined }
  entityKey: GlobalEntityKey
  entityId: string
  isNew: boolean
  logger: AppLogger
  _handleSave: () => Promise<void>
  _handleUndo: () => void
  unifiedSaveState: UseEntityCardSaveStateReturn
}
