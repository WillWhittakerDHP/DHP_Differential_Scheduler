/**
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { nextTick } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { UseEntityCardSaveHandlersParams } from '@/types/admin/entityCardSaveHandlers'


export interface UseEntityCardSaveHandlersReturn {
  resetFormWithSavedEntity: () => void
  handleSave: () => Promise<void>
  handleUndo: () => void
}

export function useEntityCardSaveHandlers(params: UseEntityCardSaveHandlersParams): UseEntityCardSaveHandlersReturn {
  const {
    form,
    admin,
    entityKey,
    entityId,
    isNew,
    logger,
    _handleSave,
    _handleUndo,
    unifiedSaveState,
  } = params

  const resetFormWithSavedEntity = (): void => {
    const savedEntity = admin.getEntity(entityKey, toGlobalEntityId(entityId))
    if (!savedEntity) {
      logger.error('Saved entity not found after save', { entityKey, entityId })
      throw new Error(`Saved entity not found after save: ${entityKey} ${entityId}`)
    }
    form.resetForm({ values: { ...savedEntity } })
    form.setValues({ ...savedEntity })
    logger.debug('Form reset after save', { entityId })
  }

  const handleSave = async (): Promise<void> => {
    const formValueKeys = Object.keys(form.values)
    logger.debug('Save triggered', {
      entityKey,
      entityId,
      isDirty: form.meta.value.dirty,
      formValues: formValueKeys,
    })
    await _handleSave()
    await nextTick()
    if (!isNew) resetFormWithSavedEntity()
    unifiedSaveState.resetSaveState()
  }

  const handleUndo = (): void => {
    _handleUndo()
    unifiedSaveState.resetSaveState()
  }

  return { resetFormWithSavedEntity, handleSave, handleUndo }
}
