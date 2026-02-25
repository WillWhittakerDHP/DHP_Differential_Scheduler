import type { Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { UseEntityCardSaveStateReturn } from '@/types/admin/entityCardSaveState'
import type { AppLogger } from '@/utils/logger'

export interface UseEntityCardSaveAndActionsParams {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  isNew: boolean
  form: Ref<FormContext | undefined>
  admin: { getEntity: (key: GlobalEntityKey, id: string) => Record<string, unknown> | undefined }
  emit: {
    (e: 'delete', id: string): void
    (e: 'saved', entity: GlobalEntity<GlobalEntityKey>): void
    (e: 'cancelled'): void
    (e: 'duplicate', entity: GlobalEntity<GlobalEntityKey>): void
  }
  logger: AppLogger
}

export interface UseEntityCardSaveAndActionsReturn {
  handleSave: () => Promise<void>
  handleUndo: () => void
  showDeleteDialog: Ref<boolean>
  handleDeleteClick: () => void
  handleDelete: () => Promise<void>
  handleCancelDelete: () => void
  handleCancel: () => void
  handleDuplicate: () => Promise<void>
  unifiedSaveState: UseEntityCardSaveStateReturn
}
