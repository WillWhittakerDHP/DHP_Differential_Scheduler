/**
 * WHY: Entity Card Actions Composable

WHY: Moves business logic out of compone...
 */
import { isRef, ref, type Ref } from 'vue'
import { useEntityForm } from '../useEntityForm'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { entityDisplay } from '@/utils/admin/entityDisplay'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { UseEntityCardActionsOptions, UseEntityCardActionsReturn } from '@/types/admin/entityCardActions'
import {
  executeEntityCardDelete,
  executeEntityCardSave,
} from '@/composables/admin/entityCardActionsPersistence'

export function useEntityCardActions(options: UseEntityCardActionsOptions): UseEntityCardActionsReturn {
  const { entityKey, entity: entityOption, form: formRef, isNew = false, onDelete, onSaved, onCancelled } = options

  const formInstance = formRef.value
  if (!formInstance) {
    throw new Error('useEntityCardActions requires form from useEntityCardForm')
  }

  const entity: Ref<GlobalEntity<GlobalEntityKey>> = isRef(entityOption)
    ? entityOption
    : ref(entityOption)

  const { create: createEntity, update: updateEntity, remove } = useEntityCrud(entityKey)

  const { success, error: showError } = useNotification()

  const { getEntitySuccessMessage, getEntityCreateMessage, getEntityDeleteTitle } = entityDisplay(useAdminConfig())

  const showDeleteDialog = ref(false)

  const entityFormComposable = useEntityForm({
    entityKey,
    entityId: (entity.value as { id: string }).id,
    form: formInstance,
    entity,
  })

  const { canSave, hasChanges, validate: validateForm, reset: resetForm } = entityFormComposable

  const handleSave = async (): Promise<void> => {
    await executeEntityCardSave<GlobalEntityKey>({
      entityKey,
      isNew,
      validateForm,
      showError,
      success,
      formInstance,
      entity,
      createEntity,
      updateEntity,
      getEntityCreateMessage,
      getEntitySuccessMessage,
      onSaved,
    })
  }

  const handleUndo = (): void => {
    resetForm()
  }

  const handleDeleteClick = (): void => {
    showDeleteDialog.value = true
  }

  const handleDelete = async (): Promise<void> => {
    await executeEntityCardDelete<GlobalEntityKey>({
      entityKey,
      entity,
      showError,
      success,
      remove,
      getEntityDeleteTitle,
      onDelete,
      closeDialog: () => {
        showDeleteDialog.value = false
      },
    })
  }

  const handleCancelDelete = (): void => {
    showDeleteDialog.value = false
  }

  const handleCancel = (): void => {
    onCancelled?.()
  }

  return {
    canSave,
    hasChanges,
    showDeleteDialog,
    isNew,
    handleSave,
    handleUndo,
    handleDeleteClick,
    handleDelete,
    handleCancelDelete,
    handleCancel,
  }
}
