/**
 * WHY: Entity Card Actions Composable

WHY: Moves business logic out of compone...
 */
import { ref } from 'vue'
import { useEntityForm } from '../useEntityForm'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { entityDisplay } from '@/utils/admin/entityDisplay'
import { getApiErrorMessage } from '../useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import type { UseEntityCardActionsOptions, UseEntityCardActionsReturn } from '@/types/admin/entityCardActions'

export type { UseEntityCardActionsOptions, UseEntityCardActionsReturn } from '@/types/admin/entityCardActions'

const logger = createLogger('useEntityCardActions')

export function useEntityCardActions(
  options: UseEntityCardActionsOptions
): UseEntityCardActionsReturn {
  const {
    entityKey,
    entity: entityOption,
    form: formRef,
    isNew = false,
    onDelete,
    onSaved,
    onCancelled
  } = options

  const formInstance = formRef.value
  if (!formInstance) {
    throw new Error('useEntityCardActions requires form from useEntityCardForm')
  }
  
  const entity = 'value' in entityOption ? entityOption : ref(entityOption)
  
  const { create: createEntity, update: updateEntity, remove } = useEntityCrud(entityKey)
  
  const { success, error: showError } = useNotification()
  
  const { getEntitySuccessMessage, getEntityCreateMessage, getEntityDeleteTitle } = entityDisplay(useAdminConfig())
  
  const showDeleteDialog = ref(false)
  
  const entityFormComposable = useEntityForm({
    entityKey,
    entityId: (entity.value as { id: string }).id,
    form: formInstance,
    entity
  })
  
  const {
    canSave,
    hasChanges,
    validate: validateForm,
    reset: resetForm,
    save: _saveForm
  } = entityFormComposable
  
  const handleSave = async (): Promise<void> => {
    try {
      // Use composable validate method
      const isValid = await validateForm()
      if (!isValid) {
        showError('Please fix form errors before saving')
        return
      }
      
      const formValues = formInstance.values as Record<string, ValidAdminValue>
      
      // PATTERN: Spread original entity first, then form values override (form values take precedence)
      const entityVal = entity.value as Record<string, ValidAdminValue>
      const entityToSave = {
        ...entityVal,
        ...formValues,
      } as Record<string, ValidAdminValue>
      
      if (isNew) {
        const createdEntity = await createEntity(entityToSave)
        success(getEntityCreateMessage(entityKey))
        onSaved?.(createdEntity as GlobalEntity<typeof entityKey>)
      } else {
      await updateEntity(entityToSave, toGlobalEntityId((entityVal as { id: string }).id))
      success(getEntitySuccessMessage(entityKey))
        onSaved?.(entity.value as GlobalEntity<typeof entityKey>)
      }
    } catch (err) {
      logger.error('Entity save failed', { err, entityKey })
      const errorMessage = getApiErrorMessage(err, `Failed to save ${entityKey}. Please try again.`)
      showError(errorMessage)
    }
  }
  
  const handleUndo = (): void => {
    resetForm()
  }
  
  /**
   * PATTERN: Function that updates reactive state
   */
  const handleDeleteClick = (): void => {
    showDeleteDialog.value = true
  }
  
  const handleDelete = async (): Promise<void> => {
    try {
      const entityVal = entity.value as { id: string }
      const entityId = toGlobalEntityId(entityVal.id)
      await remove(entityId)
      showDeleteDialog.value = false
      success(`${getEntityDeleteTitle(entityKey)} deleted successfully`)
      onDelete?.(entityId)
    } catch (err) {
      logger.error('Entity delete failed', { err, entityKey })
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityKey}`
      showError(errorMessage)
    }
  }
  
  /**
   * PATTERN: Function that resets reactive state
   */
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
    handleCancel
  }
}

