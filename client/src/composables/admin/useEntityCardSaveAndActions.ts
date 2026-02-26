/**
 * PATTERN: EntityCard actions + save state + save handlers in one composable.
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useEntityCardActions } from '@/composables/admin/useEntityCardActions'
import { useEntityCardSaveState } from '@/composables/admin/useEntityCardSaveState'
import { useEntityCardSaveHandlers } from '@/composables/admin/useEntityCardSaveHandlers'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { UseEntityCardSaveAndActionsParams, UseEntityCardSaveAndActionsReturn } from '@/types/admin/entityCardSaveAndActions'


export function useEntityCardSaveAndActions(
  params: UseEntityCardSaveAndActionsParams
): UseEntityCardSaveAndActionsReturn {
  const { entityKey, entity, isNew, form, admin, emit, logger } = params

  const formInstance = form.value
  if (!formInstance) {
    throw new Error('useEntityCardSaveAndActions requires form to be set')
  }

  const entityCardActions = useEntityCardActions({
    entityKey,
    entity: computed(() => entity),
    form,
    isNew,
    onDelete: (id: string) => emit('delete', id),
    onSaved: (entity: GlobalEntity<GlobalEntityKey>) => emit('saved', entity),
    onCancelled: () => emit('cancelled'),
  })

  const {
    showDeleteDialog,
    handleSave: _handleSave,
    handleUndo: _handleUndo,
    handleDeleteClick,
    handleDelete,
    handleCancelDelete,
    handleCancel,
  } = entityCardActions

  const unifiedSaveState = useEntityCardSaveState({
    form: formInstance,
    entityKey,
    entityId: entity.id,
    getEntityValues: () => {
      const savedEntity = isNew
        ? entity
        : (admin.getEntity(entityKey, toGlobalEntityId(String(entity.id))) || entity)
      return savedEntity as Record<string, unknown>
    },
  })

  const saveHandlers = useEntityCardSaveHandlers({
    form: formInstance,
    admin,
    entityKey,
    entityId: entity.id,
    isNew,
    logger,
    _handleSave,
    _handleUndo,
    unifiedSaveState,
  })

  async function handleDuplicate(): Promise<void> {
    if (entityKey !== 'blockInstance') return
    emit('duplicate', entity as GlobalEntity<'blockInstance'>)
  }

  return {
    handleSave: saveHandlers.handleSave,
    handleUndo: saveHandlers.handleUndo,
    showDeleteDialog,
    handleDeleteClick,
    handleDelete,
    handleCancelDelete,
    handleCancel,
    handleDuplicate,
    unifiedSaveState,
  }
}
