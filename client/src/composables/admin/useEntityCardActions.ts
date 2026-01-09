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
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'

/**
 * Entity Card Actions Composable Options
 */
export interface UseEntityCardActionsOptions {
  /**
   * Entity type key
   */
  entityKey: GlobalEntityKey
  
  /**
   * Entity instance (existing entity or initial values for new entity)
   */
  entity: Ref<GlobalEntity<GlobalEntityKey>> | GlobalEntity<GlobalEntityKey>
  
  /**
   * Form instance (optional - will create if not provided)
   */
  form?: FormContext
  
  /**
   * Whether this is a new entity being created (vs editing existing)
   */
  isNew?: boolean
  
  /**
   * Delete event emitter function (for existing entities)
   */
  onDelete?: (id: string) => void
  
  /**
   * Saved event emitter function (for new entities - passes created entity)
   */
  onSaved?: (entity: GlobalEntity<GlobalEntityKey>) => void
  
  /**
   * Cancelled event emitter function (for new entities)
   */
  onCancelled?: () => void
}

/**
 * Entity Card Actions Composable Return Type
 */
export interface UseEntityCardActionsReturn {
  /**
   * Whether form can be saved
   */
  canSave: Ref<boolean>
  
  /**
   * Whether form has changes
   */
  hasChanges: Ref<boolean>
  
  /**
   * Delete dialog visibility state
   */
  showDeleteDialog: Ref<boolean>
  
  /**
   * Whether this is a new entity being created
   */
  isNew: boolean
  
  /**
   * Save handler (creates new or updates existing)
   */
  handleSave: () => Promise<void>
  
  /**
   * Reset/undo handler
   */
  handleUndo: () => void
  
  /**
   * Delete click handler (opens dialog)
   */
  handleDeleteClick: () => void
  
  /**
   * Delete confirmation handler
   */
  handleDelete: () => Promise<void>
  
  /**
   * Cancel delete handler (closes dialog)
   */
  handleCancelDelete: () => void
  
  /**
   * Cancel creation handler (for new entities only)
   */
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
  
  // Convert entity to Ref if needed
  const entity = 'value' in entityOption ? entityOption : ref(entityOption)
  
  // Form instance - use provided or create new
  const form = providedForm || useForm({
    initialValues: {
      ...entity.value,
    }
  })
  
  // Entity CRUD operations
  const { create: createEntity, update: updateEntity, remove } = useEntityCrud(entityKey)
  
  // Notifications
  const { success, error: showError } = useNotification()
  
  // Entity display composable
  const { getEntitySuccessMessage, getEntityDeleteTitle } = useEntityDisplay()
  
  // Delete dialog state
  const showDeleteDialog = ref(false)
  
  // Entity form composable (only for existing entities)
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
      
      // Get form values
      const formValues = form.values as Record<string, ValidAdminValue>
      
      if (isNew) {
        // Create new entity
        const createdEntity = await createEntity(formValues)
        success(`${getEntityDeleteTitle(entityKey)} created successfully`)
        onSaved?.(createdEntity)
      } else {
        // Update existing entity
      await updateEntity(formValues, entity.value.id)
      success(getEntitySuccessMessage(entityKey))
        // LEARNING: Also call onSaved for existing entities to allow parent to collapse card
        // WHY: Consistent behavior - both new and existing cards emit saved event
        onSaved?.(entity.value)
      }
    } catch (err) {
      showError(`Failed to save ${entityKey}. Please try again.`)
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
      onDelete?.(String(entity.value.id))
    } catch (err) {
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

