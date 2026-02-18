/**
 * Entity Card Actions Composable
 * 
 * LEARNING: Extracts action handlers (save/reset/delete) from EntityCard component
 * WHY: Moves business logic out of component into reusable composable
 * PATTERN: Composable that wraps useEntityForm + useEntityCrud and provides action handlers
 * 
 * This composable handles:
 * - Form validation and save operations
 * - Form reset operations
 * - Delete operations with confirmation
 * - Success/error notifications
 */

import { ref, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import { useEntityForm } from '../useEntityForm'
import { useEntityCrud } from '../useEntity'
import { useNotification } from '../useNotification'
import { useEntityDisplay } from './useEntityDisplay'
import { getApiErrorMessage } from '../useApiErrorMessage'
import { createLogger } from '@/utils/logger'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'

const logger = createLogger('useEntityCardActions')

export interface UseEntityCardActionsOptions {
  entityKey: GlobalEntityKey
  
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
  
  form?: FormContext
  
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
 * Entity Card Actions Composable
 * 
 * LEARNING: Provides action handlers for EntityCard component
 * WHY: Extracts save/reset/delete logic from component to composable
 * PATTERN: Composable that wraps useEntityForm + useEntityCrud
 */
export function useEntityCardActions(
  options: UseEntityCardActionsOptions
): UseEntityCardActionsReturn {
  const {
    entityKey,
    entity: entityOption,
    form: providedForm,
    isNew = false,
    onDelete,
    onSaved,
    onCancelled
  } = options
  
  const entity = 'value' in entityOption ? entityOption : ref(entityOption)
  
  const form = providedForm || useForm({
    initialValues: {
      ...entity.value,
    }
  })
  
  const { create: createEntity, update: updateEntity, remove } = useEntityCrud(entityKey)
  
  const { success, error: showError } = useNotification()
  
  const { getEntitySuccessMessage, getEntityCreateMessage, getEntityDeleteTitle } = useEntityDisplay()
  
  const showDeleteDialog = ref(false)
  
  const entityFormComposable = useEntityForm({
    entityKey,
    entityId: entity.value.id,
    form,
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
   * LEARNING: Save handler - handles both create and update
   * WHY: Validates form and creates or updates entity in database
   * PATTERN: Check isNew flag to determine operation type
   */
  const handleSave = async (): Promise<void> => {
    try {
      // Use composable validate method
      const isValid = await validateForm()
      if (!isValid) {
        showError('Please fix form errors before saving')
        return
      }
      
      const formValues = form.values as Record<string, ValidAdminValue>
      
      // PATTERN: Spread original entity first, then form values override (form values take precedence)
      const entityToSave = {
        ...entity.value,
        ...formValues,
      } as Record<string, ValidAdminValue>
      
      if (isNew) {
        const createdEntity = await createEntity(entityToSave)
        success(getEntityCreateMessage(entityKey))
        onSaved?.(createdEntity)
      } else {
      await updateEntity(entityToSave, entity.value.id)
      success(getEntitySuccessMessage(entityKey))
        onSaved?.(entity.value)
      }
    } catch (err) {
      logger.error('Entity save failed', { err, entityKey })
      const errorMessage = getApiErrorMessage(err, `Failed to save ${entityKey}. Please try again.`)
      showError(errorMessage)
    }
  }
  
  /**
   * LEARNING: Reset/undo handler
   * WHY: Resets form to original entity values
   * PATTERN: Use composable reset method
   */
  const handleUndo = (): void => {
    resetForm()
  }
  
  /**
   * LEARNING: Delete click handler
   * WHY: Opens delete confirmation dialog
   * PATTERN: Function that updates reactive state
   */
  const handleDeleteClick = (): void => {
    showDeleteDialog.value = true
  }
  
  /**
   * LEARNING: Delete confirmation handler
   * WHY: Deletes entity from the database and emits delete event
   * PATTERN: Async function that calls remove mutation and emits event
   */
  const handleDelete = async (): Promise<void> => {
    try {
      await remove(entity.value.id)
      showDeleteDialog.value = false
      success(`${getEntityDeleteTitle(entityKey)} deleted successfully`)
      onDelete?.(entity.value.id)
    } catch (err) {
      logger.error('Entity delete failed', { err, entityKey })
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${entityKey}`
      showError(errorMessage)
    }
  }
  
  /**
   * LEARNING: Cancel delete handler
   * WHY: Closes delete confirmation dialog without deleting
   * PATTERN: Function that resets reactive state
   */
  const handleCancelDelete = (): void => {
    showDeleteDialog.value = false
  }
  
  /**
   * LEARNING: Cancel creation handler
   * WHY: Allows user to cancel new entity creation
   * PATTERN: Emit cancelled event so parent can remove the blank card
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

