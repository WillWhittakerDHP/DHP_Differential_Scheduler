/**
 * WHY: Keeps BlockInstanceList.vue thin; moves entityList config and async remove out of SFC (component-logic Tier1).
 */
import { useRouter } from 'vue-router'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { entityList } from '@/utils/admin/entityList'
import type { EntityListReturn } from '@/utils/admin/entityList'
import type { GlobalEntity } from '@/types/entities'
import type { ComputedRef } from 'vue'

export interface UseBlockInstanceListReturn {
  entities: ComputedRef<GlobalEntity<'blockInstance'>[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  goToCreate: EntityListReturn['goToCreate']
  goToEdit: EntityListReturn['goToEdit']
  handleDelete: EntityListReturn['handleDelete']
}

export function useBlockInstanceList(): UseBlockInstanceListReturn {
  const { entities, isLoading, error, remove } = useEntityCrud('blockInstance')
  const router = useRouter()
  const { error: notifyError } = useNotification()

  const { goToCreate, goToEdit, handleDelete } = entityList({
    entityKey: 'blockInstance',
    router,
    remove: async (id) => {
      await remove(id)
    },
    notifyError,
    routes: {
      create: 'block-instance-create',
      edit: 'block-instance-edit',
    },
    deleteConfirmation: 'Are you sure you want to delete this block instance?',
    deleteErrorMessage: 'Failed to delete block instance',
  })

  return {
    entities,
    isLoading,
    error,
    goToCreate,
    goToEdit,
    handleDelete,
  }
}
