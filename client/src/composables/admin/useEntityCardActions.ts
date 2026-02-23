/**
 * WHY: Entity Card Actions Composable

WHY: Moves business logic out of compone...
 */
import { ref, type Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import { useEntityForm } from '../useEntityForm'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useNotification } from '../useNotification'
import { useEntityDisplay } from './useEntityDisplay'
import { getApiErrorMessage } from '../useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'

const logger = createLogger('useEntityCardActions')

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

/**
 * WHY: Entity Card Actions Composable

WHY: Extracts save/reset/delete logic fr...
 */
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
  
  const { getEntitySuccessMessage, getEntityCreateMessage, getEntityDeleteTitle } = useEntityDisplay()
  
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
  
  /**
   */
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
  
  /**
   */
  const handleUndo = (): void => {
    resetForm()
  }
  
  /**
   * PATTERN: Function that updates reactive state
   */
  const handleDeleteClick = (): void => {
    showDeleteDialog.value = true
  }
  
  /**
   */
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
  
  /**
   */
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

