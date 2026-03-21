import type { Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface UseEntityCardActionsOptions {
  entityKey: GlobalEntityKey
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
  form: Ref<FormContext | undefined>
  isNew?: boolean
  onDelete?: (id: string) => void
  onSaved?: (entity: GlobalEntity<GlobalEntityKey>) => void
  onCancelled?: () => void
}

export interface UseEntityCardActionsReturn {
  canSave: Ref<boolean>
  hasChanges: Ref<boolean>
  showDeleteDialog: Ref<boolean>
  isNew: boolean
  handleSave: () => Promise<void>
  handleUndo: () => void
  handleDeleteClick: () => void
  handleDelete: () => Promise<void>
  handleCancelDelete: () => void
  handleCancel: () => void
}
